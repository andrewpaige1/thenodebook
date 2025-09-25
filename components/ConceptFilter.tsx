"use client";

interface ConceptFilterProps {
  uniqueConcepts: string[];
  selectedConcept: string;
  onConceptChange: (concept: string) => void;
}

export default function ConceptFilter({ uniqueConcepts, selectedConcept, onConceptChange }: ConceptFilterProps) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-gray-800 mb-3">Filter by Concept</h2>
      <div className="flex flex-wrap gap-2">
        {uniqueConcepts.map(concept => (
          <button
            key={concept}
            onClick={() => onConceptChange(concept)}
            className={`px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200 ${
              selectedConcept === concept
                ? 'bg-gray-800 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
            }`}
          >
            {concept === 'all' ? 'All Concepts' : concept}
          </button>
        ))}
      </div>
    </div>
  );
}