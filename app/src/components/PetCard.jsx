import { pet } from '../data/mock.js';

export default function PetCard() {
  return (
    <section className="card pet">
      <div className="pet-art" aria-hidden="true">
        {/* Placeholder until the Venus flytrap artwork is ready */}
        🪴
      </div>
      <div>
        <h2>{pet.name}</h2>
        <p className="muted">Venus flytrap · Level {pet.level}</p>
        <p className="muted">Feeling {pet.mood.toLowerCase()}</p>
      </div>
    </section>
  );
}
