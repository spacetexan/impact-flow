import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Target, Lightbulb, Trophy, User, CheckCircle, Plus, X } from 'lucide-react';
import { useDelegation } from '@/context/DelegationContext';
import { toast } from '@/hooks/use-toast';
import { ProjectStatus } from '@/types/delegation';

interface AddDelegationWizardProps {
  open: boolean;
  onClose: () => void;
}

const STEPS = [
  { id: 'name', title: 'Project Name', icon: Target },
  { id: 'purpose', title: 'The "Why"', icon: Target },
  { id: 'importance', title: 'The Importance', icon: Lightbulb },
  { id: 'outcome', title: 'Ideal Outcome', icon: Trophy },
  { id: 'criteria', title: 'Success Criteria', icon: CheckCircle },
  { id: 'assign', title: 'Assign', icon: User },
];

export function AddDelegationWizard({ open, onClose }: AddDelegationWizardProps) {
  const { profiles, addProject, addSuccessCriteria } = useDelegation();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    purpose: '',
    importance: '',
    idealOutcome: '',
    successCriteria: [] as string[],
    profileId: '',
    dueDate: '',
  });
  const [newCriterion, setNewCriterion] = useState('');

  const currentStep = STEPS[step];
  const progress = ((step + 1) / STEPS.length) * 100;

  const canProceed = () => {
    switch (step) {
      case 0:
        return formData.name.trim().length > 0;
      case 1:
        return formData.purpose.trim().length > 0;
      case 2:
        return formData.importance.trim().length > 0;
      case 3:
        return formData.idealOutcome.trim().length > 0;
      case 4:
        return true; // Success criteria is optional
      case 5:
        return formData.profileId.length > 0;
      default:
        return false;
    }
  };

  const handleAddCriterion = () => {
    if (newCriterion.trim()) {
      setFormData({
        ...formData,
        successCriteria: [...formData.successCriteria, newCriterion.trim()],
      });
      setNewCriterion('');
    }
  };

  const handleRemoveCriterion = (index: number) => {
    setFormData({
      ...formData,
      successCriteria: formData.successCriteria.filter((_, i) => i !== index),
    });
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleSubmit = () => {
    const newProject = addProject({
      profileId: formData.profileId,
      name: formData.name.trim(),
      purpose: formData.purpose.trim(),
      importance: formData.importance.trim(),
      idealOutcome: formData.idealOutcome.trim(),
      status: 'planned' as ProjectStatus,
      dueDate: formData.dueDate || null,
      comments: '',
    });

    // Add all success criteria to the new project
    formData.successCriteria.forEach((criterion) => {
      addSuccessCriteria({
        projectId: newProject.id,
        description: criterion,
        isComplete: false,
      });
    });

    toast({ title: 'Delegation created', description: `"${formData.name}" has been added.` });
    resetAndClose();
  };

  const resetAndClose = () => {
    setStep(0);
    setFormData({ name: '', purpose: '', importance: '', idealOutcome: '', successCriteria: [], profileId: '', dueDate: '' });
    setNewCriterion('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={resetAndClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <currentStep.icon className="w-5 h-5 text-primary" />
            {currentStep.title}
          </DialogTitle>
          <DialogDescription>
            Step {step + 1} of {STEPS.length} — Impact Filter Framework
          </DialogDescription>
        </DialogHeader>

        <Progress value={progress} className="h-1" />

        <div className="py-4 min-h-[160px]">
          {step === 0 && (
            <div className="space-y-3">
              <Label htmlFor="name">What is this project called?</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Q1 Product Roadmap"
                autoFocus
              />
            </div>
          )}

          {step === 1 && (
            <div className="space-y-3">
              <Label htmlFor="purpose">What do we want to accomplish?</Label>
              <p className="text-sm text-muted-foreground">
                Define the core purpose and what this project aims to achieve.
              </p>
              <Textarea
                id="purpose"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                placeholder="We want to accomplish..."
                className="min-h-[100px]"
                autoFocus
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <Label htmlFor="importance">What is the biggest difference this will make?</Label>
              <p className="text-sm text-muted-foreground">
                Explain why this matters and what impact it will have.
              </p>
              <Textarea
                id="importance"
                value={formData.importance}
                onChange={(e) => setFormData({ ...formData, importance: e.target.value })}
                placeholder="This is important because..."
                className="min-h-[100px]"
                autoFocus
              />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <Label htmlFor="outcome">What does the completed project look like?</Label>
              <p className="text-sm text-muted-foreground">
                Describe the ideal end state when this is done successfully.
              </p>
              <Textarea
                id="outcome"
                value={formData.idealOutcome}
                onChange={(e) => setFormData({ ...formData, idealOutcome: e.target.value })}
                placeholder="When complete, we will have..."
                className="min-h-[100px]"
                autoFocus
              />
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3">
              <Label>What specific results define "Done"?</Label>
              <p className="text-sm text-muted-foreground">
                Add measurable criteria to track progress. (Optional)
              </p>
              <div className="flex gap-2">
                <Input
                  value={newCriterion}
                  onChange={(e) => setNewCriterion(e.target.value)}
                  placeholder="e.g., All stakeholders have signed off"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCriterion())}
                  autoFocus
                />
                <Button type="button" size="icon" onClick={handleAddCriterion} disabled={!newCriterion.trim()}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {formData.successCriteria.length > 0 && (
                <ul className="space-y-2 mt-3">
                  {formData.successCriteria.map((criterion, index) => (
                    <li key={index} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                      <CheckCircle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="flex-1 text-sm">{criterion}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleRemoveCriterion(index)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Who will own this delegation?</Label>
                <Select
                  value={formData.profileId}
                  onValueChange={(v) => setFormData({ ...formData, profileId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select team member..." />
                  </SelectTrigger>
                  <SelectContent>
                    {profiles.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} — {p.role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date (optional)</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-row justify-between sm:justify-between">
          <Button variant="outline" onClick={handleBack} disabled={step === 0}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button onClick={handleNext} disabled={!canProceed()}>
            {step === STEPS.length - 1 ? 'Create Delegation' : 'Next'}
            {step < STEPS.length - 1 && <ArrowRight className="w-4 h-4 ml-2" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
