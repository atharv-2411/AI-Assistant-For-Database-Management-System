import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ConnectivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'trino' | 'spark' | 'mysql' | 'postgresql';
}

interface ConnectionForm {
  host: string;
  port: string;
  username: string;
  password: string;
  catalog?: string;
  schema?: string;
  // Spark specific fields
  masterUrl?: string;
  appName?: string;
  deployMode?: string;
}

export function ConnectivityModal({ isOpen, onClose, type }: ConnectivityModalProps) {
  const getDefaultPort = () => {
    switch(type) {
      case 'mysql': return '3306';
      case 'postgresql': return '5432';
      case 'trino': return '8080';
      default: return '7077';
    }
  };

  const [formData, setFormData] = useState<ConnectionForm>({
    host: '',
    port: getDefaultPort(),
    username: '',
    password: '',
    catalog: 'hive',
    schema: 'default',
    masterUrl: 'spark://localhost:7077',
    appName: 'My Spark App',
    deployMode: 'client'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleInputChange = (field: keyof ConnectionForm) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    // Clear previous error/success messages
    setError('');
    setSuccess('');
  };

  const handleConnect = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (type === 'mysql' || type === 'postgresql') {
        if (!formData.host || !formData.username || !formData.password) {
          throw new Error('Host, username, and password are required');
        }

        const response = await fetch('/api/db-connect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type,
            host: formData.host,
            port: parseInt(formData.port),
            username: formData.username,
            password: formData.password,
            database: formData.schema
          })
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Connection failed');
        
        setSuccess(`Successfully connected to ${type.toUpperCase()}!`);
        setTimeout(() => handleClose(), 2000);
        
      } else if (type === 'trino') {
        // Validate required fields for Trino
        if (!formData.host || !formData.username) {
          throw new Error('Host and username are required');
        }

        const response = await fetch('/api/trino-connect', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            host: formData.host,
            port: parseInt(formData.port) || 8080,
            username: formData.username,
            password: formData.password,
            catalog: formData.catalog,
            schema: formData.schema,
            http_scheme: 'http' // You can make this configurable
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Connection failed');
        }

        setSuccess('Successfully connected to Trino!');
        console.log('Trino connection established:', result.connection_id);
        
        // Auto-close modal after successful connection
        setTimeout(() => {
          handleClose();
        }, 2000);

      } else {
        // Spark connection logic (placeholder - implement based on your Spark setup)
        console.log('Connecting to Spark with:', formData);
        setSuccess('Spark connection functionality is not implemented yet');
        setTimeout(() => {
          handleClose();
        }, 2000);
      }

    } catch (err: any) {
      console.error('Connection error:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      host: '',
      port: type === 'trino' ? '8080' : '7077',
      username: '',
      password: '',
      catalog: 'hive',
      schema: 'default',
      masterUrl: 'spark://localhost:7077',
      appName: 'My Spark App',
      deployMode: 'client'
    });
    setError('');
    setSuccess('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Connect to {type.charAt(0).toUpperCase() + type.slice(1)}</DialogTitle>
          <DialogDescription>
            Enter your {type} connection details to establish a connection.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleConnect} className="space-y-4">
          {(type === 'mysql' || type === 'postgresql') ? (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-200">Host *</label>
                <Input 
                  placeholder="localhost" 
                  value={formData.host}
                  onChange={handleInputChange('host')}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-200">Port</label>
                <Input 
                  placeholder={getDefaultPort()} 
                  type="number" 
                  value={formData.port}
                  onChange={handleInputChange('port')}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-200">Database Name</label>
                <Input 
                  placeholder="my_database" 
                  value={formData.schema}
                  onChange={handleInputChange('schema')}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-200">Username *</label>
                <Input 
                  placeholder="username" 
                  value={formData.username}
                  onChange={handleInputChange('username')}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-200">Password *</label>
                <Input 
                  placeholder="password" 
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  required
                />
              </div>
            </>
          ) : type === 'trino' ? (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Host *</label>
                <Input 
                  placeholder="localhost" 
                  value={formData.host}
                  onChange={handleInputChange('host')}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Port</label>
                <Input 
                  placeholder="8080" 
                  type="number" 
                  value={formData.port}
                  onChange={handleInputChange('port')}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Username *</label>
                <Input 
                  placeholder="your-username" 
                  value={formData.username}
                  onChange={handleInputChange('username')}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Password</label>
                <Input 
                  placeholder="your-password" 
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange('password')}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Catalog</label>
                <Input 
                  placeholder="hive" 
                  value={formData.catalog}
                  onChange={handleInputChange('catalog')}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Schema</label>
                <Input 
                  placeholder="default" 
                  value={formData.schema}
                  onChange={handleInputChange('schema')}
                />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Spark Master URL</label>
                <Input 
                  placeholder="spark://localhost:7077" 
                  value={formData.masterUrl}
                  onChange={handleInputChange('masterUrl')}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Application Name</label>
                <Input 
                  placeholder="My Spark App" 
                  value={formData.appName}
                  onChange={handleInputChange('appName')}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Deploy Mode</label>
                <Input 
                  placeholder="client" 
                  value={formData.deployMode}
                  onChange={handleInputChange('deployMode')}
                />
              </div>
            </>
          )}
          
          {/* Error Message */}
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}
          
          {/* Success Message */}
          {success && (
            <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
              {success}
            </div>
          )}
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Connecting...' : 'Connect'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}