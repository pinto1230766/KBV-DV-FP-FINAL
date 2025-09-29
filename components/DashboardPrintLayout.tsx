import React from 'react';
import { CongregationProfile, Host, Speaker, Visit } from '../types';
import { UNASSIGNED_HOST } from '../constants';

interface DashboardPrintLayoutProps {
    speakers: Speaker[];
    hosts: Host[];
    upcomingVisits: Visit[];
    archivedVisits: Visit[];
    congregationProfile: CongregationProfile;
}

export const DashboardPrintLayout: React.FC<DashboardPrintLayoutProps> = ({ speakers, hosts, upcomingVisits, archivedVisits, congregationProfile }) => {

    const visitsNeedingHost = upcomingVisits.filter(v => 
        v.host === UNASSIGNED_HOST && 
        v.status !== 'cancelled' && 
        v.locationType === 'physical' && 
        !v.congregation.toLowerCase().includes('lyon')
    );
    
    const formatDate = (dateString: string) => new Date(dateString + 'T00:00:00').toLocaleDateString('fr-FR');
    const formatFullDate = (dateString: string) => new Date(dateString + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <div className="p-6 font-sans text-base text-black bg-white">
            <div className="text-center mb-6 pb-4 border-b-2 border-black">
                <h1 className="text-3xl font-bold">{congregationProfile.name}</h1>
                <p className="text-lg">{congregationProfile.subtitle}</p>
                <h2 className="text-xl mt-2">Rapport du Tableau de Bord - {new Date().toLocaleDateString('fr-FR')}</h2>
            </div>

            <section className="mb-6">
                <h3 className="text-xl font-bold border-b pb-1 mb-3">Statistiques Clés</h3>
                <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                        <p className="text-3xl font-bold">{speakers.length}</p>
                        <p>Orateurs</p>
                    </div>
                    <div>
                        <p className="text-3xl font-bold">{hosts.length}</p>
                        <p>Contacts d'Accueil</p>
                    </div>
                    <div>
                        <p className="text-3xl font-bold">{upcomingVisits.length}</p>
                        <p>Visites à Venir</p>
                    </div>
                    <div>
                        <p className="text-3xl font-bold">{archivedVisits.length}</p>
                        <p>Visites Archivées</p>
                    </div>
                </div>
            </section>

            {visitsNeedingHost.length > 0 && (
                <section className="mb-6 print-page-break">
                    <h3 className="text-xl font-bold border-b pb-1 mb-3 text-red-600">Actions Requises : Accueils à Assigner</h3>
                    <table className="w-full text-left text-sm border-collapse">
                        <thead>
                            <tr className="border-b-2 border-black">
                                <th className="p-1">Date</th>
                                <th className="p-1">Orateur</th>
                                <th className="p-1">Congrégation</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visitsNeedingHost.map(visit => (
                                <tr key={visit.visitId} className="border-b">
                                    <td className="p-1">{formatDate(visit.visitDate)}</td>
                                    <td className="p-1 font-semibold">{visit.nom}</td>
                                    <td className="p-1">{visit.congregation}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            )}

            <section>
                <h3 className="text-xl font-bold border-b pb-1 mb-3">Prochaines Visites</h3>
                {upcomingVisits.length > 0 ? (
                    <table className="w-full text-left text-sm border-collapse">
                         <thead>
                            <tr className="border-b-2 border-black">
                                <th className="p-1">Date</th>
                                <th className="p-1">Orateur</th>
                                <th className="p-1">Thème du discours</th>
                                <th className="p-1">Accueil</th>
                            </tr>
                        </thead>
                        <tbody>
                            {upcomingVisits.map(visit => (
                                <tr key={visit.visitId} className="border-b">
                                    <td className="p-1 align-top">{formatDate(visit.visitDate)}</td>
                                    <td className="p-1 align-top">
                                        <p className="font-semibold">{visit.nom}</p>
                                        <p className="text-xs">{visit.congregation}</p>
                                    </td>
                                    <td className="p-1 align-top">{visit.talkTheme || 'N/A'}</td>
                                    <td className="p-1 align-top">{visit.host}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>Aucune visite programmée.</p>
                )}
            </section>
        </div>
    );
};