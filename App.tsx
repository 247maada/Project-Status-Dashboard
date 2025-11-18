import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import { SectionData, Task } from './types.ts';
import { ClipboardListIcon, CheckCircleIcon, ArrowRightIcon } from './components/icons.tsx';
import Header from './components/Header.tsx';
import SectionCard from './components/SectionCard.tsx';
import BreakdownModal from './components/BreakdownModal.tsx';

const initialData: SectionData[] = [
  {
    title: 'ACTION PLAN',
    type: 'checklist',
    icon: <ClipboardListIcon />,
    tasks: [
      { id: 'ap1', text: 'Fix all Google Sheets', details: 'verify sheet names → reconnect n8n service account.', completed: true },
      { id: 'ap2', text: 'Merge Phase 1/2/3 into one Unified Data System', completed: true },
      { id: 'ap3', text: 'Build master automation workflow for MDI, LES & KIDIS', completed: false },
      { id: 'ap4', text: 'Activate SMTP email reminders', completed: false },
      { id: 'ap5', text: 'Deploy Web3 Homepage updates', completed: false },
      { id: 'ap6', text: 'Prepare 7-day content rollout for book promotion', completed: false },
    ],
  },
  {
    title: 'SYSTEM UPDATES',
    type: 'update',
    icon: <CheckCircleIcon />,
    tasks: [
      { id: 'su1', text: 'Phase 2 sheet corrected to “Dashboard”', completed: true },
      { id: 'su2', text: 'Phase 3 tabs auto-indexed', completed: true },
      { id: 'su3', text: 'Service Account linked', completed: true },
    ],
  },
  {
    title: 'NEXT STEPS',
    type: 'next-steps',
    icon: <ArrowRightIcon />,
    tasks: [
      { id: 'ns1', text: 'Upload JSON key into n8n', completed: false },
      { id: 'ns2', text: 'Grant editing permissions to service email', completed: false },
      { id: 'ns3', text: 'Paste workflow template into n8n', completed: false },
    ],
  },
];

const App: React.FC = () => {
  const [sections, setSections] = useState<SectionData[]>(initialData);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [breakdown, setBreakdown] = useState<string>('');
  const [isLoadingBreakdown, setIsLoadingBreakdown] = useState<boolean>(false);

  const handleToggleTask = useCallback((taskId: string) => {
    setSections(prevSections =>
      prevSections.map(section => {
        if (section.type === 'update') return section;
        return {
          ...section,
          tasks: section.tasks.map(task =>
            task.id === taskId ? { ...task, completed: !task.completed } : task
          ),
        };
      })
    );
  }, []);

  const handleBreakdownRequest = useCallback(async (taskId: string) => {
    const task = sections.flatMap(s => s.tasks).find(t => t.id === taskId);
    if (!task) return;

    setSelectedTaskId(taskId);
    setIsLoadingBreakdown(true);
    setBreakdown('');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const systemInstruction = `You are a project management assistant. Break the following task into a short, actionable list of sub-tasks. Each sub-task should be on a new line, starting with a hyphen. Do not add any introductory or concluding text.`;
      const userPrompt = `Task: "${task.text}${task.details ? ` - ${task.details}` : ''}"`;
      
      // FIX: Refactored the prompt to use systemInstruction for better separation of concerns and to follow Gemini API best practices.
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userPrompt,
        config: {
          systemInstruction: systemInstruction,
        },
      });

      setBreakdown(response.text);
    } catch (error) {
      console.error("Error generating task breakdown:", error);
      setBreakdown("Sorry, I couldn't break down this task. Please try again.");
    } finally {
      setIsLoadingBreakdown(false);
    }
  }, [sections]);

  const handleCloseModal = () => {
    setSelectedTaskId(null);
  };
  
  const selectedTask = selectedTaskId ? sections.flatMap(s => s.tasks).find(t => t.id === selectedTaskId) : null;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col">
      <Header />
      <main className="flex-grow p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sections.map((section) => (
              <SectionCard
                key={section.title}
                title={section.title}
                type={section.type}
                icon={section.icon}
                tasks={section.tasks}
                onToggleTask={handleToggleTask}
                onBreakdownTask={handleBreakdownRequest}
              />
            ))}
          </div>
        </div>
      </main>
      {selectedTask && (
        <BreakdownModal
            task={selectedTask}
            breakdown={breakdown}
            isLoading={isLoadingBreakdown}
            onClose={handleCloseModal}
        />
      )}
      <footer className="text-center p-4 text-gray-400 text-sm">
        <p>Dashboard generated to organize project tasks and provide clarity on build objectives.</p>
        <p className="mt-1">
          The original issue `Error: Cannot find module '@vitejs/plugin-react'` is a missing dev dependency. Fix by running: `npm install -D @vitejs/plugin-react`
        </p>
      </footer>
    </div>
  );
};

export default App;
