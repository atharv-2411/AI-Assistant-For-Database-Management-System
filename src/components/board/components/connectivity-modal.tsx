import React from 'react';
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
  type: 'trino' | 'spark';
}

export function ConnectivityModal({ isOpen, onClose, type }: ConnectivityModalProps) {
  const handleConnect = (event: React.FormEvent) => {
    event.preventDefault();
    // Handle connection logic here
    console.log('Connecting to', type);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect to Database</DialogTitle>
          <DialogDescription>
            {type === 'trino' 
              ? 'Enter your Trino connection details to establish a connection.'
              : 'Enter your Spark connection details to establish a connection.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleConnect} className="space-y-4">
          {type === 'trino' ? (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Host</label>
                <Input placeholder="localhost" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Port</label>
                <Input placeholder="8080" type="number" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Catalog</label>
                <Input placeholder="hive" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Schema</label>
                <Input placeholder="default" />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Spark Master URL</label>
                <Input placeholder="spark://localhost:7077" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Application Name</label>
                <Input placeholder="My Spark App" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Deploy Mode</label>
                <Input placeholder="client" />
              </div>
            </>
          )}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Connect
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}