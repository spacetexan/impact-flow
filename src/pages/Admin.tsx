import { useState } from 'react';
import { useDelegation } from '@/context/DelegationContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, UserPlus, User, Pencil } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Profile } from '@/domain';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Admin() {
  const { profiles, addProfile, updateProfile, deleteProfile } = useDelegation();
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');

  // Edit state
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    addProfile({ 
      name: newName.trim(), 
      role: newRole.trim() || 'Team Member' 
    });
    
    toast({ 
      title: 'Team member added', 
      description: `${newName} has been added to your team.` 
    });
    
    setNewName('');
    setNewRole('');
  };

  const startEditing = (profile: Profile) => {
    setEditingProfile(profile);
    setEditName(profile.name);
    setEditRole(profile.role);
  };

  const handleUpdateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProfile || !editName.trim()) return;

    updateProfile(editingProfile.id, {
      name: editName.trim(),
      role: editRole.trim() || 'Team Member'
    });

    toast({
      title: 'Team member updated',
      description: `${editName} has been updated.`
    });

    setEditingProfile(null);
  };

  const handleDeleteMember = (id: string, name: string) => {
    deleteProfile(id);
    toast({ 
      title: 'Team member removed', 
      description: `${name} has been removed from your team.` 
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Team Administration</h1>
        <p className="text-muted-foreground mt-2">
          Manage your team members and their roles.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-[350px_1fr]">
        {/* Add Member Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Add Member
            </CardTitle>
            <CardDescription>
              Add a new person to your delegation pool.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddMember} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Sarah Chen"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  placeholder="e.g. Senior Developer"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={!newName.trim()}>
                Add Team Member
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Team List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Current Team ({profiles.length})
            </CardTitle>
            <CardDescription>
              View and manage existing team members.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                      No team members yet. Add someone to get started!
                    </TableCell>
                  </TableRow>
                ) : (
                  profiles.map((profile) => (
                    <TableRow key={profile.id}>
                      <TableCell className="font-medium">{profile.name}</TableCell>
                      <TableCell>{profile.role}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-muted-foreground hover:text-primary"
                            onClick={() => startEditing(profile)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove Team Member?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to remove {profile.name}? This will also remove all their assigned projects.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteMember(profile.id, profile.name)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Remove
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingProfile} onOpenChange={(open) => !open && setEditingProfile(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Team Member</DialogTitle>
            <DialogDescription>
              Update the details for this team member.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateMember} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="e.g. Sarah Chen"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Role</Label>
              <Input
                id="edit-role"
                value={editRole}
                onChange={(e) => setEditRole(e.target.value)}
                placeholder="e.g. Senior Developer"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditingProfile(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!editName.trim()}>
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
