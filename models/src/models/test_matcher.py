"""
Verification and sanity test suite for Model 3: Resume-to-Job Matcher & Dynamic Question Selector.
"""
import sys
import time
from pathlib import Path
import joblib

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from src.models.resume_matcher import ResumeJobMatcher, export_matcher

# Sample Senior Backend Job Description
SAMPLE_JD = """
Senior Distributed Backend Engineer
We are seeking a Senior Backend Engineer to architect and scale our mission-critical distributed services.
Key Responsibilities:
- Design high-throughput, fault-tolerant distributed systems handling 50k+ QPS.
- Build event-driven streaming pipelines using Apache Kafka and message queues.
- Implement high-performance microservices in Go (Golang) and manage caching layers with Redis.
- Orchestrate containerized workloads on Kubernetes clusters with strong CI/CD practices.
Requirements:
- Deep expertise in Distributed Systems, consensus protocols, and horizontal scalability.
- Hands-on experience with Kafka topic partitioning, consumer group rebalancing, and offsets.
- Strong proficiency in Go and distributed caching patterns using Redis.
- Familiarity with Docker, Kubernetes, and PostgreSQL.
"""

# Sample Candidate Resume (Python/Django background, lacking Kafka & Distributed Systems depth)
SAMPLE_RESUME = """
Jane Doe - Backend Software Engineer
Summary:
Passionate backend developer with 4 years of experience building web applications and REST APIs.
Technical Skills:
- Languages: Python, SQL, Bash
- Frameworks: Flask, Django, FastAPI
- Databases: PostgreSQL, SQLite
- Infrastructure: Docker, Git, Linux, CI/CD
Experience:
- Developed and deployed multi-tenant SaaS REST APIs using Python, Flask, and PostgreSQL.
- Containerized microservice endpoints with Docker and managed automated testing pipelines.
- Optimized relational database queries and indexed Postgres tables for fast retrieval.
"""


def test_matcher():
    # 1. Export and reload artifact
    _ = export_matcher()
    matcher = joblib.load("exports/model3_matcher.joblib")

    print("=" * 80)
    print("MODEL 3: RESUME-TO-JOB MATCHING & GAP ANALYSIS")
    print("=" * 80)

    t0 = time.perf_counter()
    result = matcher.evaluate_candidate(
        resume_source=SAMPLE_RESUME,
        jd_source=SAMPLE_JD,
        num_questions=4,
        difficulty="Senior"
    )
    latency_ms = (time.perf_counter() - t0) * 1000

    match_analysis = result["match_analysis"]
    targeted_questions = result["targeted_interview_questions"]

    print(f"\nMatch Score:           {match_analysis['overall_match_score']}%")
    print(f"Skill Coverage Ratio:  {match_analysis['skill_coverage_ratio'] * 100:.1f}%")
    print(f"Semantic Similarity:   {match_analysis['semantic_similarity'] * 100:.1f}%")
    print(f"Matched Skills:        {match_analysis['matched_skills']}")
    print(f"Missing Skill Gaps:    {match_analysis['missing_skills']}")
    print(f"Latency:               {latency_ms:.2f} ms (Target < 200 ms)")

    print("\n" + "=" * 80)
    print("DYNAMICALLY SELECTED INTERVIEW QUESTIONS (Targeting Skill Gaps)")
    print("=" * 80)
    for i, q in enumerate(targeted_questions, 1):
        print(f"\n{i}. [{q['topic']} | {q['difficulty']}]")
        print(f"   Targeted Gaps: {q['targeted_skill_gaps']}")
        print(f"   Question:      {q['question']}")
        print(f"   Rubric:        {q['reference_concepts']}")

    # Verification assertions
    missing_set = set(match_analysis["missing_skills"])
    matched_set = set(match_analysis["matched_skills"])

    # 1. Ensure required missing skills were identified
    assert "Distributed Systems" in missing_set, "Failed to identify Distributed Systems as missing skill"
    assert "Kafka" in missing_set, "Failed to identify Kafka as missing skill"
    assert "Go" in missing_set, "Failed to identify Go as missing skill"
    assert "Redis" in missing_set, "Failed to identify Redis as missing skill"

    # 2. Ensure candidate skills were recognized as matched
    assert "Docker" in matched_set, "Docker should be detected in matched skills"
    assert "PostgreSQL" in matched_set, "PostgreSQL should be detected in matched skills"
    assert "CI/CD" in matched_set, "CI/CD should be detected in matched skills"

    # 3. Ensure dynamically selected questions cover the primary skill gaps
    all_gaps_addressed = set()
    for q in targeted_questions:
        all_gaps_addressed.update(q["targeted_skill_gaps"])
    
    assert "Distributed Systems" in all_gaps_addressed, "Question selection missed Distributed Systems gap"
    assert "Kafka" in all_gaps_addressed, "Question selection missed Kafka gap"
    assert latency_ms < 200.0, f"Latency exceeded budget: {latency_ms:.2f} ms"

    print("\n" + "-" * 80)
    print("ALL ASSERTION TESTS PASSED: Model 3 accurately isolates skill gaps & selects questions.")
    print("-" * 80)


if __name__ == "__main__":
    test_matcher()
