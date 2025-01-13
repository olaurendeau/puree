'use client';

import { useState, useRef, useEffect } from "react";

// Ajout du type pour les messages
type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function Home() {
  // Remplacer les états individuels par un tableau de messages
  const [messages, setMessages] = useState<Message[]>([]);
  // Référence pour le conteneur de messages
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fonction pour scroll en bas
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Effet pour scroller après chaque mise à jour des messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Ajouter le gestionnaire pour la touche Entrée
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const form = e.currentTarget.form;
      if (form) form.requestSubmit();
    }
  };

  // Ajout du gestionnaire pour ajuster la hauteur du textarea
  const handleTextareaInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    const lineHeight = 24; // hauteur approximative d'une ligne en pixels
    const maxHeight = lineHeight * 5; // 5 lignes maximum
    
    // Réinitialiser la hauteur pour obtenir la vraie hauteur du contenu
    textarea.style.height = 'auto';
    
    // Définir la nouvelle hauteur en respectant la limite
    const newHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = `${newHeight}px`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const userInput = (e.target as HTMLFormElement).elements.namedItem('question') as HTMLTextAreaElement;
    if (!userInput.value.trim()) return;

    const responses = [
      "As-tu pensé à en parler avec quelqu'un ? Une vraie personne en chair et en os ?",
      "Il y a sûrement un bon vieux livre qui traite de ce sujet à la bibliothèque.",
      "Pourquoi ne pas faire une recherche sur Internet ? Sans IA, juste avec ton esprit critique.",
      "La meilleure réponse est peut-être dans ton expérience personnelle, prends le temps d'y réfléchir.",
      "As-tu essayé de résoudre ce problème par toi-même ? C'est souvent plus gratifiant.",
      "Un expert dans ce domaine pourrait t'apporter une réponse plus pertinente qu'une IA.",
      "La solution est peut-être dans un documentaire ou un podcast sur le sujet ?",
      "Parfois, une simple promenade peut t'aider à trouver la réponse par toi-même.",
      "Tu pourrais rejoindre un groupe local qui s'intéresse à ce sujet.",
      "As-tu pensé à tenir un journal pour noter tes réflexions sur ce sujet ?",
      "Pourquoi ne pas organiser un brainstorming avec des amis ?",
      "La bibliothèque municipale a probablement des ressources intéressantes sur ce sujet.",
      "Il existe sûrement des forums spécialisés avec des passionnés du domaine.",
      "As-tu essayé de dessiner ou schématiser ton problème ? Ça aide à réfléchir.",
      "Une association locale pourrait t'aider dans cette démarche.",
      "Méditer sur la question pourrait t'apporter des perspectives intéressantes.",
      "As-tu demandé l'avis de tes grands-parents ? Leur expérience pourrait être précieuse.",
      "Un bon vieux cahier et un crayon peuvent faire des merveilles pour organiser ses idées.",
      "Pourquoi ne pas en discuter autour d'un café avec des amis ?",
      "Les réseaux sociaux, sans IA, regorgent de communautés passionnées sur ce sujet.",
      "As-tu pensé à consulter les archives locales ?",
      "Un club de discussion sur ce thème existe peut-être près de chez toi.",
      "La solution est peut-être dans un vieux magazine spécialisé.",
      "As-tu essayé d'écrire tes pensées à ce sujet ?",
      "Une conversation avec un inconnu peut parfois apporter un nouveau point de vue.",
      "Pourquoi ne pas organiser un petit atelier sur ce thème ?",
      "Les personnes âgées de ton quartier ont sûrement une expérience à partager.",
      "As-tu cherché des événements locaux en rapport avec ce sujet ?",
      "Un musée proche pourrait avoir des informations intéressantes.",
      "Pourquoi ne pas créer un groupe d'étude sur ce sujet ?",
      "As-tu consulté les journaux locaux ?",
      "Une balade en nature peut parfois éclaircir les idées.",
      "Les centres culturels organisent souvent des conférences intéressantes.",
      "As-tu pensé à faire du bénévolat dans ce domaine ?",
      "Un voyage pourrait t'apporter de nouvelles perspectives.",
      "Pourquoi ne pas participer à un atelier créatif ?",
      "Les marchés locaux sont d'excellents endroits pour rencontrer des passionnés.",
      "As-tu essayé de tenir un blog sur ce sujet ?",
      "Une exposition pourrait t'inspirer de nouvelles idées.",
      "Les cafés-débats sont parfaits pour échanger sur ce genre de questions.",
      "As-tu pensé à rejoindre un club de lecture spécialisé ?",
      "Les artisans locaux ont souvent des connaissances précieuses à partager.",
      "Pourquoi ne pas créer un petit projet personnel sur ce thème ?",
      "Les festivals thématiques sont d'excellentes sources d'inspiration.",
      "As-tu essayé de faire des expériences par toi-même ?",
      "Une radio locale a peut-être une émission sur ce sujet.",
      "Les jardins partagés sont des lieux d'échange et d'apprentissage.",
      "Pourquoi ne pas organiser une petite exposition sur ce thème ?",
      "As-tu pensé à interviewer des experts locaux ?",
      "Les marchés aux puces regorgent de trésors et de connaissances.",
      "Une collection personnelle pourrait t'aider à approfondir le sujet.",
      "As-tu essayé de créer une newsletter sur ce thème ?",
      "Les salons professionnels sont d'excellentes sources d'information.",
      "Pourquoi ne pas lancer un podcast sur ce sujet ?",
      "Les vieux journaux peuvent contenir des informations précieuses.",
      "As-tu pensé à organiser des rencontres thématiques ?",
      "Les bibliothécaires sont souvent des mines d'or d'information.",
      "Une chaîne YouTube sans IA pourrait t'inspirer.",
      "As-tu essayé de faire des maquettes ou des prototypes ?",
      "Les petites annonces locales cachent parfois des opportunités.",
      "Pourquoi ne pas créer un petit guide sur ce sujet ?",
      "Les archives municipales sont pleines de surprises.",
      "As-tu pensé à faire des interviews vidéo sur ce thème ?",
      "Les vieux magazines spécialisés sont souvent très instructifs.",
      "Une exposition photo pourrait illustrer ton sujet.",
      "As-tu essayé de créer une carte mentale ?",
      "Les concours locaux peuvent stimuler ta créativité.",
      "Pourquoi ne pas organiser un petit festival ?",
      "Les anciennes publicités peuvent être révélatrices.",
      "As-tu pensé à créer un jeu de société sur ce thème ?",
      "Les vieilles cartes postales racontent des histoires fascinantes.",
      "Une collection d'objets vintage pourrait t'inspirer.",
      "As-tu essayé de faire des recherches généalogiques ?",
      "Les petits théâtres locaux sont des lieux d'échange uniques.",
      "Pourquoi ne pas créer un petit musée personnel ?",
      "Les vieux outils ont beaucoup à nous apprendre.",
      "As-tu pensé à faire des expériences culinaires ?",
      "Les traditions locales peuvent être source d'inspiration.",
      "Une collection de timbres peut ouvrir des perspectives.",
      "As-tu essayé de faire des moulages ou des empreintes ?",
      "Les vieux métiers ont des secrets à partager.",
      "Pourquoi ne pas créer un herbier sur ce thème ?",
      "Les techniques ancestrales sont souvent pertinentes.",
      "As-tu pensé à faire des relevés ou des mesures ?",
      "Les légendes locales peuvent être instructives.",
      "Une collection de sons pourrait être intéressante.",
      "As-tu essayé de faire des observations régulières ?",
      "Les recettes traditionnelles cachent des savoirs précieux.",
      "Pourquoi ne pas créer un petit laboratoire ?",
      "Les vieux dictons sont pleins de sagesse.",
      "As-tu pensé à faire des expériences artistiques ?",
      "Les techniques artisanales ont fait leurs preuves.",
      "Une collection de graines pourrait t'inspirer.",
      "As-tu essayé de faire des relevés météorologiques ?",
      "Les contes populaires sont riches d'enseignements.",
      "Pourquoi ne pas créer un petit atelier ?",
      "Les remèdes de grand-mère ont leur logique.",
      "As-tu pensé à faire des observations astronomiques ?",
      "Les jeux traditionnels ont beaucoup à nous apprendre.",
      "Une collection de pierres pourrait être passionnante.",
      "As-tu essayé de faire des expériences botaniques ?",
      "Les chansons populaires racontent des histoires.",
      "Pourquoi ne pas créer un petit jardin d'expérimentation ?",
      "Les techniques de construction traditionnelles sont fascinantes.",
      "As-tu pensé à faire des observations naturalistes ?",
      "Les danses traditionnelles transmettent des savoirs.",
      "Une collection d'insectes pourrait t'éclairer."
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    // Ajouter les nouveaux messages à l'historique
    const value = userInput.value
    setMessages(prev => [
      ...prev,
      { role: 'user', content: value },
      { role: 'assistant', content: randomResponse }
    ]);
    
    // Réinitialiser le champ de saisie
    userInput.value = '';
  };

  return (
    <div className="min-h-screen bg-[#0C0C0C] text-white">
      <div className="h-14 border-b border-zinc-800 flex items-center px-4">
        <h1 className="text-xl font-semibold">purée.ai</h1>
      </div>
      
      <main className="flex flex-col h-[calc(100vh-3.5rem)]">
        <div className="flex-1 overflow-auto px-4 py-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-3">
                  <h2 className="text-2xl font-medium text-zinc-200">Bienvenue sur purée.ai</h2>
                  <p className="text-zinc-400">L&apos;IA qui te suggère de ne pas utiliser l&apos;IA</p>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message, index) => (
                  <div 
                    key={`${message.role}-${index}-${message.content.substring(0, 10)}`} 
                    className="flex gap-4 items-start"
                  >
                    <div className={`w-8 h-8 rounded-full ${message.role === 'user' ? 'bg-zinc-700' : 'bg-purple-700'} flex items-center justify-center`}>
                      <span className="text-sm">{message.role === 'user' ? '👤' : '🤖'}</span>
                    </div>
                    <div className="flex-1">
                      <pre className="text-zinc-200 whitespace-pre-wrap font-sans">
                        {message.content}
                      </pre>
                    </div>
                  </div>
                ))}
                {/* Élément invisible pour le scroll */}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </div>

        <div className="border-t border-zinc-800 p-4">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
            <div className="relative">
              <textarea
                name="question"
                placeholder="Pose ta question à l'IA..."
                className="w-full p-4 pr-24 bg-zinc-900 border border-zinc-700 rounded-lg focus:outline-none focus:border-purple-500 resize-none overflow-y-auto"
                rows={1}
                required
                autoFocus
                onKeyDown={handleKeyDown}
                onInput={handleTextareaInput}
                style={{ minHeight: '60px', maxHeight: '120px' }} // 120px = 5 lignes environ
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
              >
                Envoyer
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
