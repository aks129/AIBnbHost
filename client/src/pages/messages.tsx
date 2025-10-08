import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Clock, Send, CheckCircle2, Edit2, Trash2 } from 'lucide-react';
import Navigation from '@/components/navigation';

interface MessageTemplate {
  id: string;
  name: string;
  category: 'pre-arrival' | 'check-in' | 'mid-stay' | 'check-out' | 'post-stay';
  subject: string;
  content: string;
  enabled: boolean;
  sendTimeOffset: number; // hours before/after event
  createdAt: string;
}

export default function MessagesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const { data: templates = [], isLoading } = useQuery<MessageTemplate[]>({
    queryKey: ['/api/scheduled-messages/templates'],
  });

  const createMutation = useMutation({
    mutationFn: async (template: Partial<MessageTemplate>) => {
      const response = await fetch('/api/scheduled-messages/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template),
      });
      if (!response.ok) throw new Error('Failed to create template');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/scheduled-messages/templates'] });
      toast({ title: 'Template created successfully' });
      setIsCreating(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...template }: Partial<MessageTemplate> & { id: string }) => {
      const response = await fetch(`/api/scheduled-messages/templates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template),
      });
      if (!response.ok) throw new Error('Failed to update template');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/scheduled-messages/templates'] });
      toast({ title: 'Template updated successfully' });
      setEditingTemplate(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/scheduled-messages/templates/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete template');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/scheduled-messages/templates'] });
      toast({ title: 'Template deleted successfully' });
    },
  });

  const templatesByCategory = {
    'pre-arrival': templates.filter(t => t.category === 'pre-arrival'),
    'check-in': templates.filter(t => t.category === 'check-in'),
    'mid-stay': templates.filter(t => t.category === 'mid-stay'),
    'check-out': templates.filter(t => t.category === 'check-out'),
    'post-stay': templates.filter(t => t.category === 'post-stay'),
  };

  const categoryInfo = {
    'pre-arrival': { icon: Clock, color: 'text-blue-600', label: 'Pre-Arrival' },
    'check-in': { icon: MessageSquare, color: 'text-green-600', label: 'Check-In' },
    'mid-stay': { icon: MessageSquare, color: 'text-purple-600', label: 'Mid-Stay' },
    'check-out': { icon: Send, color: 'text-orange-600', label: 'Check-Out' },
    'post-stay': { icon: CheckCircle2, color: 'text-gray-600', label: 'Post-Stay' },
  };

  const TemplateEditor = ({ template, onSave, onCancel }: {
    template: Partial<MessageTemplate>;
    onSave: (template: Partial<MessageTemplate>) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState(template);

    return (
      <Card>
        <CardHeader>
          <CardTitle>{template.id ? 'Edit Template' : 'New Template'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Template Name</Label>
            <Input
              id="name"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Welcome Message"
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              className="w-full border rounded-md p-2"
              value={formData.category || 'pre-arrival'}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
            >
              <option value="pre-arrival">Pre-Arrival</option>
              <option value="check-in">Check-In</option>
              <option value="mid-stay">Mid-Stay</option>
              <option value="check-out">Check-Out</option>
              <option value="post-stay">Post-Stay</option>
            </select>
          </div>

          <div>
            <Label htmlFor="sendTimeOffset">Send Time (hours before/after event)</Label>
            <Input
              id="sendTimeOffset"
              type="number"
              value={formData.sendTimeOffset || 0}
              onChange={(e) => setFormData({ ...formData, sendTimeOffset: parseInt(e.target.value) })}
              placeholder="e.g., -24 for 24 hours before"
            />
          </div>

          <div>
            <Label htmlFor="subject">Subject Line</Label>
            <Input
              id="subject"
              value={formData.subject || ''}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="Welcome to [Property Name]!"
            />
          </div>

          <div>
            <Label htmlFor="content">Message Content</Label>
            <Textarea
              id="content"
              rows={8}
              value={formData.content || ''}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Hi [Guest Name]..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Use variables: [Guest Name], [Property Name], [Check-In Date], [Check-Out Date]
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.enabled ?? true}
                onCheckedChange={(enabled) => setFormData({ ...formData, enabled })}
              />
              <Label>Enabled</Label>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => onSave(formData)} className="flex-1">
              Save Template
            </Button>
            <Button onClick={onCancel} variant="outline" className="flex-1">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Automated Messages</h1>
              <p className="text-gray-600">Configure scheduled messages for your guests</p>
            </div>
            <Button onClick={() => setIsCreating(true)}>
              <MessageSquare className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </div>
        </div>

        {isCreating && (
          <div className="mb-6">
            <TemplateEditor
              template={{ enabled: true, sendTimeOffset: 0 }}
              onSave={(template) => createMutation.mutate(template)}
              onCancel={() => setIsCreating(false)}
            />
          </div>
        )}

        {editingTemplate && (
          <div className="mb-6">
            <TemplateEditor
              template={editingTemplate}
              onSave={(template) => updateMutation.mutate({ ...template, id: editingTemplate.id })}
              onCancel={() => setEditingTemplate(null)}
            />
          </div>
        )}

        <Tabs defaultValue="pre-arrival" className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full">
            {Object.entries(categoryInfo).map(([key, info]) => (
              <TabsTrigger key={key} value={key}>
                {info.label}
                {templatesByCategory[key as keyof typeof templatesByCategory].length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {templatesByCategory[key as keyof typeof templatesByCategory].length}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(categoryInfo).map(([category, info]) => {
            const Icon = info.icon;
            const categoryTemplates = templatesByCategory[category as keyof typeof templatesByCategory];

            return (
              <TabsContent key={category} value={category} className="space-y-4">
                {categoryTemplates.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6 text-center text-gray-500">
                      <Icon className={`h-12 w-12 mx-auto mb-4 ${info.color}`} />
                      <p>No templates for {info.label} yet</p>
                      <Button
                        onClick={() => setIsCreating(true)}
                        variant="outline"
                        className="mt-4"
                      >
                        Create Template
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  categoryTemplates.map(template => (
                    <Card key={template.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              {template.name}
                              {template.enabled ? (
                                <Badge className="bg-green-100 text-green-800">Active</Badge>
                              ) : (
                                <Badge variant="secondary">Disabled</Badge>
                              )}
                            </CardTitle>
                            <CardDescription>
                              Sends {template.sendTimeOffset > 0 ? `${template.sendTimeOffset} hours after` : `${Math.abs(template.sendTimeOffset)} hours before`} event
                            </CardDescription>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingTemplate(template)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteMutation.mutate(template.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div>
                            <span className="text-sm font-semibold">Subject:</span>
                            <p className="text-sm text-gray-700">{template.subject}</p>
                          </div>
                          <div>
                            <span className="text-sm font-semibold">Content:</span>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{template.content}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </div>
  );
}
