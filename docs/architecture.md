# Initial Architecture

## Product flow

1. Student captures or uploads a textbook page.
2. Backend validates and stores the image privately.
3. OCR extracts Tamil/English text and retains page/document metadata.
4. Student reviews and corrects extracted text.
5. Text is chunked and embedded into the student's private knowledge space.
6. Hybrid retrieval searches personal notes and the curated verified corpus.
7. Evidence checks evaluate source authority, date, relevance and contradictions.
8. The answer generator returns a grounded answer with source references or abstains.
9. Quiz results feed a separate spaced-revision scheduler.

## Knowledge separation

- Personal corpus: private, user-scoped documents and OCR chunks.
- Verified corpus: curated, versioned reference materials with provenance.
- Retrieval must enforce user ownership at the database query level, not only in prompts.

## Initial engineering principles

- Evidence before generation.
- Preserve source title, page number, URL, publication/version date and extraction method.
- Never label an answer "verified" unless supporting evidence has been checked.
- Keep OCR confidence separate from answer evidence quality.
- Never silently resolve conflicting sources.
- Do not train on or share private student uploads by default.

## Planned services

- ingestion: upload validation, image preprocessing, OCR
- knowledge: chunking, embeddings, indexing
- retrieval: personal retrieval, verified retrieval, hybrid ranking
- verification: claim support, citation validation, conflict detection
- generation: grounded answer and quiz generation
- revision: mastery tracking and spaced repetition
