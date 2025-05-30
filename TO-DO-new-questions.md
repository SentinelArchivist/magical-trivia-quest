# To-Do List: Expansion of Question Pool (Levels 1–4)

## Goal
Add 100 new, unique, original multiple-choice questions to each of levels 1–4, evenly distributed across Disney, Marvel, Star Wars, Pixar, and Zelda universes.

---

## 1. Data Preparation
- [ ] Review the current question JSON format in the `data/` directory.
- [ ] Confirm required fields: `questionText`, `answers` (min 3, ideally 4), `correctAnswer`, `universe`, `difficulty`, and any others used by the codebase.

## 2. Question Generation
- [ ] For each level (1–4):
    - [ ] Create 100 new, original questions (no repeats, no rewordings).
    - [ ] For each universe (Disney, Marvel, Star Wars, Pixar, Zelda):
        - [ ] Create 20 new questions per universe per level.
    - [ ] Ensure all questions are strictly multiple-choice with plausible distractors.

## 3. Data Integration
- [ ] Integrate new questions into the appropriate JSON files in `data/`.
- [ ] Validate that all new questions conform to the required schema and formatting.
- [ ] Ensure no existing questions are overwritten or lost.

## 4. Testing & Validation
- [ ] Run all existing tests (unit, integration, data validation) to confirm no regressions.
- [ ] Spot-check a sample of new questions for correctness, formatting, and gameplay suitability.
- [ ] Confirm all new data loads and displays correctly in the game.

## 5. Documentation
- [ ] Update README or data documentation to reflect the expanded question pool and any new guidelines for question creation.

## 6. Final Review
- [ ] Ensure all requirements from the PRD are met and the integrity of the codebase is preserved.
- [ ] Obtain approval or sign-off before deploying changes.
