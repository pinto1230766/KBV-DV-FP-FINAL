import React from 'react';

const TestApp: React.FC = () => {
    return (
        <div className="min-h-screen bg-blue-500 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-lg">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">
                    Test de l'application
                </h1>
                <p className="text-gray-600">
                    Si vous voyez ce message, React fonctionne correctement !
                </p>
                <div className="mt-4 p-4 bg-green-100 rounded">
                    <p className="text-green-800 font-semibold">
                        ✅ Tailwind CSS fonctionne aussi !
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TestApp;