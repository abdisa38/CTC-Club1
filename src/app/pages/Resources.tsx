import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Badge } from "../components/ui/Badge";
import { Search, Download, Eye, FileText, Image as ImageIcon, Code, MoreVertical, Filter } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/Dialog";

export function Resources() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

  const resources = [
    { id: 1, title: "React Architecture Cheatsheet", type: "pdf", size: "2.4 MB", course: "Advanced React", date: "Oct 12, 2026", icon: FileText, color: "text-red-500" },
    { id: 2, title: "UI Components Figma File", type: "design", size: "15.8 MB", course: "UI/UX Design", date: "Oct 10, 2026", icon: ImageIcon, color: "text-purple-500" },
    { id: 3, title: "Express Server Starter Code", type: "code", size: "1.2 MB", course: "Node.js API", date: "Sep 28, 2026", icon: Code, color: "text-indigo-500" },
    { id: 4, title: "Data Structures Study Guide", type: "pdf", size: "4.1 MB", course: "CS 201", date: "Sep 15, 2026", icon: FileText, color: "text-red-500" },
    { id: 5, title: "Machine Learning Math Overview", type: "pdf", size: "8.5 MB", course: "AI Foundations", date: "Sep 05, 2026", icon: FileText, color: "text-red-500" },
  ];

  const filteredResources = resources.filter(r => {
    if (filterType !== 'all' && r.type !== filterType) return false;
    if (searchQuery && !r.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Resource Library</h1>
          <p className="text-slate-500 dark:text-slate-400">Download materials, starter code, and cheat sheets.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input 
            placeholder="Search resources..." 
            className="pl-10 h-12 bg-white dark:bg-slate-950" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select 
            className="h-12 w-full sm:w-48 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All File Types</option>
            <option value="pdf">PDF Documents</option>
            <option value="code">Source Code (.zip)</option>
            <option value="design">Design Files</option>
          </select>
          <Button variant="outline" className="h-12 px-4" size="icon">
            <Filter className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {filteredResources.length === 0 ? (
        <div className="text-center py-20 px-4 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900/50">
          <FileText className="mx-auto h-12 w-12 text-slate-400 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white">No resources found</h3>
          <p className="text-sm text-slate-500 mt-1">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredResources.map((res) => (
            <Card key={res.id} className="group hover:border-indigo-300 dark:hover:border-indigo-800 transition-colors bg-white dark:bg-slate-950">
              <CardContent className="p-5 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-lg bg-slate-100 dark:bg-slate-800 ${res.color}`}>
                    <res.icon className="h-8 w-8" />
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
                
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1 line-clamp-2">{res.title}</h3>
                <p className="text-xs text-indigo-600 font-medium mb-4">{res.course}</p>
                
                <div className="mt-auto flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <span>{res.size} • {res.type.toUpperCase()}</span>
                  <span>{res.date}</span>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0 gap-2 border-t border-slate-100 dark:border-slate-800 mt-0">
                {res.type === 'pdf' ? (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="secondary" className="w-full text-xs h-9"><Eye className="h-4 w-4 mr-2" /> Preview</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
                      <DialogHeader>
                        <DialogTitle>{res.title}</DialogTitle>
                        <DialogDescription>{res.course} • {res.size}</DialogDescription>
                      </DialogHeader>
                      <div className="flex-1 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center">
                        <div className="text-center">
                          <FileText className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                          <p className="text-slate-500">PDF Viewer Mockup</p>
                          <Button className="mt-4"><Download className="mr-2 h-4 w-4" /> Download Original</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                ) : (
                  <Button variant="secondary" className="w-full text-xs h-9"><Download className="h-4 w-4 mr-2" /> Download</Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
