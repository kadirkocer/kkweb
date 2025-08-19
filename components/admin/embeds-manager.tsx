'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, ExternalLink, Play, Video, Music, MessageSquare, Instagram } from 'lucide-react';

interface Embed {
  id: string;
  type: 'youtube' | 'spotify' | 'twitter' | 'instagram' | 'threads';
  url: string;
  title?: string;
  description?: string;
  thumbnail?: string;
  visible: boolean;
}

export function EmbedsManager() {
  const [embeds, setEmbeds] = useState<Embed[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmbed, setEditingEmbed] = useState<Embed | null>(null);
  const [formData, setFormData] = useState<Partial<Embed>>({
    type: 'youtube',
    url: '',
    title: '',
    description: '',
    thumbnail: '',
    visible: true
  });

  useEffect(() => {
    fetchEmbeds();
  }, []);

  const fetchEmbeds = async () => {
    try {
      const response = await fetch('/api/admin/embeds');
      const data = await response.json();
      setEmbeds(data);
    } catch (error) {
      console.error('Failed to fetch embeds:', error);
    }
  };

  const handleSave = async () => {
    try {
      const embedData = {
        ...formData,
        id: editingEmbed?.id || `embed-${Date.now()}`
      };

      if (editingEmbed) {
        const updatedEmbeds = embeds.map(e => 
          e.id === editingEmbed.id ? embedData as Embed : e
        );
        await fetch('/api/admin/embeds', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedEmbeds)
        });
        setEmbeds(updatedEmbeds);
      } else {
        const response = await fetch('/api/admin/embeds', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(embedData)
        });
        const newEmbed = await response.json();
        setEmbeds([...embeds, newEmbed]);
      }
      
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Failed to save embed:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this embed?')) return;
    
    try {
      const updatedEmbeds = embeds.filter(e => e.id !== id);
      await fetch('/api/admin/embeds', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedEmbeds)
      });
      setEmbeds(updatedEmbeds);
    } catch (error) {
      console.error('Failed to delete embed:', error);
    }
  };

  const handleEdit = (embed: Embed) => {
    setEditingEmbed(embed);
    setFormData(embed);
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      type: 'youtube',
      url: '',
      title: '',
      description: '',
      thumbnail: '',
      visible: true
    });
    setEditingEmbed(null);
  };

  const getEmbedIcon = (type: string) => {
    switch (type) {
      case 'youtube': return <Video className="h-4 w-4" />;
      case 'spotify': return <Music className="h-4 w-4" />;
      case 'twitter': return <MessageSquare className="h-4 w-4" />;
      case 'instagram': return <Instagram className="h-4 w-4" />;
      case 'threads': return <MessageSquare className="h-4 w-4" />;
      default: return <Play className="h-4 w-4" />;
    }
  };

  const getEmbedColor = (type: string) => {
    switch (type) {
      case 'youtube': return 'bg-red-500';
      case 'spotify': return 'bg-green-500';
      case 'twitter': return 'bg-blue-500';
      case 'instagram': return 'bg-pink-500';
      case 'threads': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Embeds Manager</h2>
          <p className="text-gray-400">Manage your media embeds</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Embed
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingEmbed ? 'Edit Embed' : 'Add New Embed'}</DialogTitle>
              <DialogDescription>
                {editingEmbed ? 'Update embed information' : 'Create a new media embed'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">Type</Label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                  className="col-span-3 bg-gray-800 border border-gray-700 rounded-md px-3 py-2"
                >
                  <option value="youtube">YouTube</option>
                  <option value="spotify">Spotify</option>
                  <option value="twitter">Twitter</option>
                  <option value="instagram">Instagram</option>
                  <option value="threads">Threads</option>
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="url" className="text-right">URL</Label>
                <Input
                  id="url"
                  value={formData.url}
                  onChange={(e) => setFormData({...formData, url: e.target.value})}
                  placeholder="https://..."
                  className="col-span-3 bg-gray-800 border-gray-700"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="col-span-3 bg-gray-800 border-gray-700"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="col-span-3 bg-gray-800 border-gray-700"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="thumbnail" className="text-right">Thumbnail</Label>
                <Input
                  id="thumbnail"
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({...formData, thumbnail: e.target.value})}
                  placeholder="https://..."
                  className="col-span-3 bg-gray-800 border-gray-700"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="visible" className="text-right">Visible</Label>
                <Switch
                  id="visible"
                  checked={formData.visible}
                  onCheckedChange={(checked) => setFormData({...formData, visible: checked})}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave}>Save Embed</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {embeds.map((embed) => (
          <Card key={embed.id} className="bg-gray-900 border-gray-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className={`p-2 rounded-full ${getEmbedColor(embed.type)}`}>
                    {getEmbedIcon(embed.type)}
                  </div>
                  {embed.title || 'Untitled'}
                  {!embed.visible && <Badge variant="secondary">Hidden</Badge>}
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(embed)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(embed.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>
                <Badge variant="outline" className="capitalize">{embed.type}</Badge>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {embed.description && (
                <p className="text-sm text-gray-300">{embed.description}</p>
              )}
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500 font-mono truncate flex-1 mr-2">
                  {embed.url}
                </div>
                <Button size="sm" variant="outline" asChild>
                  <a href={embed.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}