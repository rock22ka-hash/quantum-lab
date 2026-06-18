import {
    Dices,
    Coins,
    Binary,
    Search,
    Share2,
    Activity,
    Brain,
    LineChart,
    AlertTriangle,
    type LucideIcon,
} from 'lucide-react';

export interface ExperimentConfig {
    id: string;
    name: string;
    icon: LucideIcon;
    color: string;
    status: 'Ready' | 'WIP';
    description: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
}

export const experiments: ExperimentConfig[] = [
    {
        id: 'qrng-1bit',
        name: '1-Bit QRNG',
        icon: Dices,
        color: '#3b82f6',
        status: 'Ready',
        description: 'Quantum Random Number Generator using Hadamard gate superposition.',
        difficulty: 'Easy',
    },
    {
        id: 'coin-flip',
        name: 'Quantum Coin Flip',
        icon: Coins,
        color: '#8b5cf6',
        status: 'Ready',
        description: 'Fair coin simulation via quantum superposition.',
        difficulty: 'Easy',
    },
    {
        id: 'qrng-8bit',
        name: '8-Bit QRNG',
        icon: Binary,
        color: '#10b981',
        status: 'Ready',
        description: 'Generate random numbers 0-255 using 8-qubit superposition.',
        difficulty: 'Medium',
    },
    {
        id: 'grover',
        name: "Grover's Search",
        icon: Search,
        color: '#f59e0b',
        status: 'Ready',
        description: 'Quadratic speedup for unstructured search.',
        difficulty: 'Medium',
    },
    {
        id: 'teleportation',
        name: 'Quantum Teleportation',
        icon: Share2,
        color: '#ec4899',
        status: 'Ready',
        description: 'Transfer quantum state via entanglement and classical bits.',
        difficulty: 'Hard',
    },
    {
        id: 'vqe-h2',
        name: 'VQE H₂ Solver',
        icon: Activity,
        color: '#22c55e',
        status: 'Ready',
        description: 'Variational Quantum Eigensolver for molecular ground state.',
        difficulty: 'Hard',
    },
    {
        id: 'vqc',
        name: 'VQC Classifier',
        icon: Brain,
        color: '#f97316',
        status: 'Ready',
        description: 'Variational Quantum Classifier on make_moons dataset.',
        difficulty: 'Hard',
    },
    {
        id: 'vqe-sweep',
        name: 'VQE Bond Sweep',
        icon: LineChart,
        color: '#14b8a6',
        status: 'Ready',
        description: 'Potential energy surface for H₂ molecule.',
        difficulty: 'Hard',
    },
    {
        id: 'barren-plateaus',
        name: 'Barren Plateaus',
        icon: AlertTriangle,
        color: '#ef4444',
        status: 'Ready',
        description: 'Demonstration of vanishing gradients in deep circuits.',
        difficulty: 'Hard',
    },
];

export interface DocFile {
    id: string;
    title: string;
    time: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced';
}

export const docFiles: DocFile[] = [
    { id: '00_Quick_Reference_Guide.md', title: 'Quick Reference Guide', time: '10 min', level: 'Beginner' },
    { id: '01_Quantum_Computing_Basics.md', title: 'Quantum Computing Basics', time: '20 min', level: 'Beginner' },
    { id: '02_Quantum_Mechanics_Fundamentals.md', title: 'Quantum Mechanics Fundamentals', time: '30 min', level: 'Beginner' },
    { id: '03_Quantum_Gates_and_Circuits.md', title: 'Quantum Gates and Circuits', time: '25 min', level: 'Intermediate' },
    { id: '04_Classical_Machine_Learning_Review.md', title: 'Classical Machine Learning Review', time: '20 min', level: 'Intermediate' },
    { id: '05_Quantum_Machine_Learning_Intro.md', title: 'Quantum Machine Learning Intro', time: '30 min', level: 'Intermediate' },
    { id: '06_Quantum_Algorithms.md', title: 'Quantum Algorithms', time: '40 min', level: 'Advanced' },
    { id: '07_Programming_with_Qiskit.md', title: 'Programming with Qiskit', time: '35 min', level: 'Intermediate' },
    { id: '08_Hands_on_QML_Projects.md', title: 'Hands-on QML Projects', time: '45 min', level: 'Advanced' },
    { id: '09_Alternative_Frameworks_and_Future_Projects.md', title: 'Alternative Frameworks and Future', time: '20 min', level: 'Intermediate' },
    { id: '10_Project_Adaptation_Roadmap.md', title: 'Project Adaptation Roadmap', time: '15 min', level: 'Beginner' },
    { id: '11_Quantum_Computing_Essentials.md', title: 'Quantum Computing Essentials', time: '25 min', level: 'Beginner' },
    { id: '12_Classical_Genetic_Algorithms.md', title: 'Classical Genetic Algorithms', time: '20 min', level: 'Intermediate' },
];
