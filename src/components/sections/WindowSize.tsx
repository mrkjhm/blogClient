// src/components/WindowSize.tsx
'use client';                      // ← this makes it run in the browser
import { useEffect,useState } from 'react';

export default function WindowSize() {
    const [size, setSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const updateSize = () => {
            setSize({ width: window.innerWidth, height: window.innerHeight });
        };

        updateSize();                              // set initial
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);                                      // runs exactly once

    return (
        <div className="sticky top-0 z-50 bg-gray-50 rounded shadow-sm">
            <div className="h-20 5xl:bg-amber-600 4xl:bg-pink-500 3xl:bg-gray-400 2xl:bg-blue-200 xl:bg-purple-500 lg:bg-amber-800 md:bg-amber-400 sm:bg-green-600 bg-cyan-500">
                <p className="5xl:flex hidden">5xl</p>
                <p className="5xl:hidden 4xl:flex hidden">4xl</p>
                <p className="4xl:hidden 3xl:flex hidden">3xl</p>
                <p className="3xl:hidden 2xl:flex hidden">2xl</p>
                <p className="2xl:hidden xl:flex hidden">extra large</p>
                <p className="xl:hidden lg:flex hidden">large</p>
                <p className="lg:hidden md:flex hidden">medium</p>
                <p className="md:hidden sm:flex hidden">small</p>
                <p className="sm:hidden flex">extra small</p>
                <p>Width: {size.width}px</p>
                <p>Height: {size.height}px</p>
            </div>
        </div>
    );
}
