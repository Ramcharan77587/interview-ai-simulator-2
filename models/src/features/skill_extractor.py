"""
Tech skill extractor and semantic similarity engine for Resume-to-Job matching.
Supports plain text and PDF resumes.
"""
import re
from pathlib import Path
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Curated canonical tech taxonomy with regex boundary patterns
SKILL_PATTERNS = {
    # Languages
    "Python": r"\b(python|python3|py)\b",
    "Go": r"\b(go|golang)\b",
    "Java": r"\b(java|jdk)\b",
    "C++": r"\b(c\+\+|cpp)\b",
    "TypeScript": r"\b(typescript|ts)\b",
    "JavaScript": r"\b(javascript|js|es6)\b",
    "Rust": r"\b(rust)\b",
    "SQL": r"\b(sql)\b",
    "Bash": r"\b(bash|shell\s+scripting)\b",
    
    # Frameworks
    "FastAPI": r"\b(fastapi)\b",
    "Flask": r"\b(flask)\b",
    "Django": r"\b(django)\b",
    "React": r"\b(react|react\.js|reactjs)\b",
    "Node.js": r"\b(node|node\.js|nodejs)\b",
    "Spring Boot": r"\b(spring\s+boot|spring)\b",
    "PyTorch": r"\b(pytorch|torch)\b",
    
    # Databases & Caching
    "PostgreSQL": r"\b(postgres|postgresql|pgsql)\b",
    "MySQL": r"\b(mysql)\b",
    "Redis": r"\b(redis)\b",
    "MongoDB": r"\b(mongodb|mongo)\b",
    "Cassandra": r"\b(cassandra)\b",
    "Elasticsearch": r"\b(elasticsearch|elastic)\b",
    "Distributed Caching": r"\b(distributed\s+caching|caching\s+tier|memcached|cache\s+invalidation)\b",
    
    # Cloud & DevOps
    "Docker": r"\b(docker|containers)\b",
    "Kubernetes": r"\b(kubernetes|k8s)\b",
    "AWS": r"\b(aws|amazon\s+web\s+services|ec2|s3|lambda)\b",
    "GCP": r"\b(gcp|google\s+cloud)\b",
    "CI/CD": r"\b(ci/cd|continuous\s+integration|github\s+actions|jenkins)\b",
    "Linux": r"\b(linux|unix)\b",
    
    # Architecture & Distributed Systems
    "Distributed Systems": r"\b(distributed\s+systems|distributed\s+architecture|distributed\s+data)\b",
    "Kafka": r"\b(kafka|apache\s+kafka)\b",
    "Microservices": r"\b(microservices|microservice\s+architecture)\b",
    "Message Queues": r"\b(message\s+queue|rabbitmq|sqs|event\s+streaming)\b",
    "Event-Driven Architecture": r"\b(event-driven|event\s+driven\s+architecture|eda)\b",
    "Concurrency": r"\b(concurrency|multithreading|asynchronous\s+programming|goroutines|async/await)\b",
    "gRPC": r"\b(grpc|protobuf|protocol\s+buffers)\b",
    "System Design": r"\b(system\s+design|high\s+availability|load\s+balancing|scalability)\b"
}


def extract_text_from_source(source: str) -> str:
    """Reads text from a file path (PDF/TXT) or returns raw text if already string content."""
    if not isinstance(source, str):
        return ""
    
    path = Path(source)
    if path.is_file():
        if path.suffix.lower() == ".pdf":
            try:
                import pypdf
                reader = pypdf.PdfReader(str(path))
                text = " ".join([page.extract_text() or "" for page in reader.pages])
                return text.strip()
            except Exception as e:
                print(f"Warning: PDF extraction failed ({e}), attempting plain read.")
        try:
            return path.read_text(encoding="utf-8", errors="ignore").strip()
        except Exception:
            pass
    return source.strip()


def extract_skills(text: str) -> set:
    """Extracts canonical tech skills from text using boundary-safe regex patterns."""
    text_lower = text.lower()
    detected = set()
    for skill, pattern in SKILL_PATTERNS.items():
        if re.search(pattern, text_lower, flags=re.IGNORECASE):
            detected.add(skill)
    return detected


def compute_semantic_similarity(text1: str, text2: str) -> float:
    """Calculates TF-IDF cosine similarity between two documents."""
    if not text1.strip() or not text2.strip():
        return 0.0
    vec = TfidfVectorizer(ngram_range=(1, 2), stop_words="english", sublinear_tf=True)
    matrix = vec.fit_transform([text1, text2])
    sim = cosine_similarity(matrix[0:1], matrix[1:2])[0][0]
    return float(np_clip := max(0.0, min(1.0, float(sim))))
