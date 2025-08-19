'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProjectsManager } from '@/components/admin/projects-manager';
import { ExperienceManager } from '@/components/admin/experience-manager';
import { SocialManager } from '@/components/admin/social-manager';
import { EmbedsManager } from '@/components/admin/embeds-manager';
import { PageManager } from '@/components/admin/builder/PageManager';
import { ObservabilityPanel } from '@/components/admin/ObservabilityPanel';
import { Button } from '@/components/ui/button';
import { Shield, Database, Briefcase, Users, Share2, Play, Terminal, FileText, BarChart3 } from 'lucide-react';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('overview');

  const handleBuildProject = async () => {
    try {
      const response = await fetch('/api/admin/build', { method: 'POST' });
      const result = await response.json();
      alert(result.message || 'Build completed!');
    } catch (error) {
      alert('Build failed: ' + error);
    }
  };

  const handleRestartDev = async () => {
    try {
      const response = await fetch('/api/admin/dev-restart', { method: 'POST' });
      const result = await response.json();
      alert(result.message || 'Dev server restarted!');
    } catch (error) {
      alert('Restart failed: ' + error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="h-8 w-8 text-blue-400" />
              Admin Panel
            </h1>
            <p className="text-gray-400 mt-1">Manage your personal website content</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleBuildProject} variant="outline" className="flex items-center gap-2">
              <Terminal className="h-4 w-4" />
              Build Project
            </Button>
            <Button onClick={handleRestartDev} variant="outline" className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Restart Dev
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-7 bg-gray-900">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="pages" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Pages
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Projects
            </TabsTrigger>
            <TabsTrigger value="experience" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Experience
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Social
            </TabsTrigger>
            <TabsTrigger value="embeds" className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Embeds
            </TabsTrigger>
            <TabsTrigger value="observability" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Monitor
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Projects</CardTitle>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">-</div>
                  <p className="text-xs text-muted-foreground">Portfolio projects</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Experience</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">-</div>
                  <p className="text-xs text-muted-foreground">Work experience entries</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Social Links</CardTitle>
                  <Share2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">-</div>
                  <p className="text-xs text-muted-foreground">Social media links</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Embeds</CardTitle>
                  <Play className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">-</div>
                  <p className="text-xs text-muted-foreground">Media embeds</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button 
                  onClick={() => setActiveTab('projects')} 
                  variant="outline" 
                  className="h-20 flex flex-col gap-2"
                >
                  <Briefcase className="h-6 w-6" />
                  Manage Projects
                </Button>
                <Button 
                  onClick={() => setActiveTab('experience')} 
                  variant="outline" 
                  className="h-20 flex flex-col gap-2"
                >
                  <Users className="h-6 w-6" />
                  Update Experience
                </Button>
                <Button 
                  onClick={() => setActiveTab('social')} 
                  variant="outline" 
                  className="h-20 flex flex-col gap-2"
                >
                  <Share2 className="h-6 w-6" />
                  Edit Social Links
                </Button>
                <Button 
                  onClick={() => setActiveTab('embeds')} 
                  variant="outline" 
                  className="h-20 flex flex-col gap-2"
                >
                  <Play className="h-6 w-6" />
                  Manage Embeds
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects" className="mt-6">
            <ProjectsManager />
          </TabsContent>

          <TabsContent value="experience" className="mt-6">
            <ExperienceManager />
          </TabsContent>

          <TabsContent value="social" className="mt-6">
            <SocialManager />
          </TabsContent>

          <TabsContent value="pages" className="mt-6">
            <PageManager />
          </TabsContent>

          <TabsContent value="embeds" className="mt-6">
            <EmbedsManager />
          </TabsContent>

          <TabsContent value="observability" className="mt-6">
            <ObservabilityPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}