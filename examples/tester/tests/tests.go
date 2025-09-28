package tests

import (
    "database/sql"
    "encoding/json"
    "fmt"
    "regexp"
    "strings"
    "time"

    _ "github.com/lib/pq"
)

type TestResult struct {
    SchemaValid        bool              `json:"schema_valid"`
    DataValid          bool              `json:"data_valid"`
    Errors             []string          `json:"errors"`
    PerformanceMetrics map[string]string `json:"performance_metrics"`
}

type TableDependency struct {
    Name         string
    Dependencies []string
}

// SQLSerializer handles the conversion of data to SQL statements
type SQLSerializer struct{}

// serializeInsert converts a table name and data into an INSERT statement
func (s *SQLSerializer) serializeInsert(tableName string, data []map[string]interface{}) (string, error) {
    if len(data) == 0 {
        return "", nil
    }

    // Get column names from the first row
    firstRow := data[0]
    var columnNames []string
    for colName := range firstRow {
        columnNames = append(columnNames, colName)
    }

    var command strings.Builder
    command.WriteString(fmt.Sprintf("INSERT INTO %s (%s)\nVALUES\n", tableName, strings.Join(columnNames, ", ")))

    for idx, row := range data {
        var values []string
        for _, colName := range columnNames {
            value, exists := row[colName]
            if !exists {
                value = nil
            }
            serializedValue := serializeValue(value)
            values = append(values, serializedValue)
        }
        command.WriteString("\t(")
        command.WriteString(strings.Join(values, ", "))
        command.WriteString(")")
        if idx < len(data)-1 {
            command.WriteString(",\n")
        } else {
            command.WriteString(";")
        }
    }
    return command.String(), nil
}

// serializeValue converts a value to its SQL string representation
func serializeValue(value interface{}) string {
    if value == nil {
        return "NULL"
    }
    switch v := value.(type) {
    case string:
        return fmt.Sprintf("'%s'", escapeString(v))
    case float64:
        return fmt.Sprintf("%v", v)
    case bool:
        return fmt.Sprintf("%v", v)
    case map[string]interface{}, []interface{}:
        jsonBytes, _ := json.Marshal(v)
        return fmt.Sprintf("'%s'", escapeString(string(jsonBytes)))
    default:
        return fmt.Sprintf("'%v'", v)
    }
}

// escapeString handles SQL string escaping
func escapeString(s string) string {
    return strings.ReplaceAll(s, "'", "''")
}

func RunTests(dsn, schema string, mockData json.RawMessage) (TestResult, error) {
    var result TestResult
    var errors []string

    db, err := sql.Open("postgres", dsn)
    if err != nil {
        errors = append(errors, "Failed to connect to database")
        result.Errors = errors
        return result, err
    }
    if db != nil {
        defer db.Close()
    }

    if err := db.Ping(); err != nil {
        errors = append(errors, fmt.Sprintf("Database ping failed: %v", err))
        result.Errors = errors
        return result, err
    }

    startTime := time.Now()

    if err := runSchemaTest(db, schema); err != nil {
        errors = append(errors, fmt.Sprintf("Schema test failed: %v", err))
        result.SchemaValid = false
    } else {
        result.SchemaValid = true
    }

    var data map[string][]map[string]interface{}
    if err := json.Unmarshal(mockData, &data); err != nil {
        errors = append(errors, fmt.Sprintf("Failed to unmarshal mock data: %v", err))
        result.Errors = errors
        return result, err
    }

    dependencies := parseTableDependencies(schema)
    orderedTables, err := getOrderedTables(dependencies)
    if err != nil {
        errors = append(errors, fmt.Sprintf("Failed to determine table order: %v", err))
        result.Errors = errors
        return result, err
    }

    for _, tableName := range orderedTables {
        if tableData, exists := data[tableName]; exists {
            if err := runAllTestsForTable(db, tableName, tableData); err != nil {
                errors = append(errors, fmt.Sprintf("Data test for table %s failed: %v", tableName, err))
            }
        }
    }

    result.DataValid = len(errors) == 0
    result.PerformanceMetrics = map[string]string{
        "execution_time": time.Since(startTime).String(),
    }
    result.Errors = errors
    return result, nil
}

func parseTableDependencies(schema string) []TableDependency {
    var dependencies []TableDependency
    
    tableRegex := regexp.MustCompile(`CREATE TABLE (\w+)`)
    fkRegex := regexp.MustCompile(`FOREIGN KEY \(.*?\) REFERENCES (\w+)`)
    
    statements := strings.Split(schema, ";")
    
    for _, stmt := range statements {
        stmt = strings.TrimSpace(stmt)
        if stmt == "" {
            continue
        }
        
        tableMatches := tableRegex.FindStringSubmatch(stmt)
        if len(tableMatches) < 2 {
            continue
        }
        
        tableName := strings.ToLower(tableMatches[1])
        
        fkMatches := fkRegex.FindAllStringSubmatch(stmt, -1)
        var deps []string
        for _, match := range fkMatches {
            if len(match) >= 2 {
                deps = append(deps, strings.ToLower(match[1]))
            }
        }
        
        dependencies = append(dependencies, TableDependency{
            Name:         tableName,
            Dependencies: deps,
        })
    }
    
    return dependencies
}

func getOrderedTables(dependencies []TableDependency) ([]string, error) {
    // Create adjacency list and track dependencies
    graph := make(map[string][]string)
    inDegree := make(map[string]int)
    
    // Initialize all tables with 0 in-degree
    for _, dep := range dependencies {
        tableName := dep.Name
        if _, exists := inDegree[tableName]; !exists {
            inDegree[tableName] = 0
        }
        // Make sure all dependency tables are in the map
        for _, d := range dep.Dependencies {
            if _, exists := inDegree[d]; !exists {
                inDegree[d] = 0
            }
        }
    }
    
    // Build the graph and count incoming edges
    for _, dep := range dependencies {
        // For each table that depends on others
        for _, d := range dep.Dependencies {
            // Add an edge from the dependency to the dependent table
            graph[d] = append(graph[d], dep.Name)
            // Increment the in-degree of the dependent table
            inDegree[dep.Name]++
        }
    }
    
    // Start with tables that have no dependencies (in-degree == 0)
    var queue []string
    for tableName, degree := range inDegree {
        if degree == 0 {
            queue = append(queue, tableName)
        }
    }
    
    var orderedTables []string
    for len(queue) > 0 {
        tableName := queue[0]
        queue = queue[1:]
        orderedTables = append(orderedTables, tableName)
        
        // For each table that depends on this one
        for _, dependent := range graph[tableName] {
            inDegree[dependent]--
            if inDegree[dependent] == 0 {
                queue = append(queue, dependent)
            }
        }
    }
    
    // Check for circular dependencies
    if len(orderedTables) != len(inDegree) {
        return nil, fmt.Errorf("circular dependency detected in schema")
    }
    
    return orderedTables, nil
}

func runSchemaTest(db *sql.DB, schema string) error {
    statements := strings.Split(schema, ";")
    for _, stmt := range statements {
        stmt = strings.TrimSpace(stmt)
        if stmt == "" {
            continue
        }
        if _, err := db.Exec(stmt); err != nil {
            return fmt.Errorf("failed to execute schema statement: %v", err)
        }
    }
    return nil
}

func runAllTestsForTable(db *sql.DB, tableName string, tableData []map[string]interface{}) error {
    serializer := SQLSerializer{}
    
    insertStmt, err := serializer.serializeInsert(tableName, tableData)
    if err != nil {
        return err
    }
    
    if insertStmt != "" {
        _, err = db.Exec(insertStmt)
        if err != nil {
            return fmt.Errorf("failed to execute SQL statements for table %s: %v", tableName, err)
        }
    }
    
    return nil
}