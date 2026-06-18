'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function EntryAnimation() {
    const [show, setShow] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setShow(false), 2400);
        return () => clearTimeout(timer);
    }, []);

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-[#050505] overflow-hidden"
                >
                    {/* Matrix grid perspective effect */}
                    <motion.div 
                        initial={{ scale: 1, opacity: 0, transform: 'rotateX(60deg) translateY(0px)' }}
                        animate={{ scale: 1.5, opacity: [0, 0.5, 0], transform: 'rotateX(60deg) translateY(-200px)' }}
                        transition={{ duration: 2.5, ease: "linear" }}
                        className="absolute inset-0"
                        style={{
                            backgroundImage: 'linear-gradient(rgba(34, 197, 94, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 197, 94, 0.2) 1px, transparent 1px)',
                            backgroundSize: '40px 40px',
                            perspective: '1000px',
                            transformOrigin: 'top',
                        }}
                    />
                    
                    {/* Core reveal text */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0, filter: 'blur(10px)' }}
                        animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
                        exit={{ scale: 1.2, opacity: 0, filter: 'blur(10px)' }}
                        transition={{ duration: 1.2 }}
                        className="relative z-10 text-center"
                    >
                        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-[0.3em] text-white" style={{ textShadow: '0 0 30px #22c55e, 0 0 60px #16a34a' }}>
                            Q-Matrix
                        </h1>
                        <motion.div 
                            initial={{ width: 0, left: '50%' }}
                            animate={{ width: '100%', left: 0 }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="relative h-1 mt-6 bg-gradient-to-r from-transparent via-[#22c55e] to-transparent shadow-[0_0_15px_#22c55e]"
                        />
                        <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="mt-6 text-[11px] font-bold uppercase tracking-[0.5em] text-[#22c55e] opacity-80"
                        >
                            Initializing Sequence...
                        </motion.p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
