"""
Model 3: Resume-to-Job Matcher & Dynamic Question Selection Engine.
Performs skill gap analysis and selects targeted interview questions based on candidate deficiencies.
"""
import json
import joblib
from pathlib import Path
from typing import List, Dict, Union, Set
from src.features.skill_extractor import (
    extract_text_from_source,
    extract_skills,
    compute_semantic_similarity
)


class ResumeJobMatcher:
    def __init__(self, questions_path: str = "data/raw/questions.json"):
        self.questions_path = Path(questions_path)
        self.question_bank = self._load_questions()

    def _load_questions(self) -> List[Dict]:
        if self.questions_path.exists():
            with open(self.questions_path, "r", encoding="utf-8") as f:
                return json.load(f)
        return []

    def analyze_match(self, resume_source: str, jd_source: str) -> Dict:
        """
        Analyzes alignment between a resume and job description.
        Returns match score, matched skills, missing skill gaps, and skill coverage.
        """
        resume_text = extract_text_from_source(resume_source)
        jd_text = extract_text_from_source(jd_source)

        resume_skills = extract_skills(resume_text)
        jd_skills = extract_skills(jd_text)

        matched_skills = sorted(list(resume_skills.intersection(jd_skills)))
        missing_skills = sorted(list(jd_skills - resume_skills))

        # Skill coverage: fraction of JD skills demonstrated
        skill_coverage = len(matched_skills) / max(1, len(jd_skills))
        
        # Unsupervised semantic similarity across descriptions
        semantic_sim = compute_semantic_similarity(resume_text, jd_text)

        # Composite match score: 70% skill overlap + 30% semantic text overlap
        overall_score = round(min(100.0, (skill_coverage * 0.70 + semantic_sim * 0.30) * 100.0), 1)

        return {
            "overall_match_score": overall_score,
            "skill_coverage_ratio": round(skill_coverage, 3),
            "semantic_similarity": round(semantic_sim, 3),
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
            "resume_skill_count": len(resume_skills),
            "jd_skill_count": len(jd_skills),
            "resume_text_snippet": resume_text[:200] + "...",
            "jd_text_snippet": jd_text[:200] + "..."
        }

    def select_targeted_questions(
        self,
        missing_skills: List[str],
        top_k: int = 5,
        preferred_difficulty: str = "Senior"
    ) -> List[Dict]:
        """
        Dynamically ranks and picks questions that target candidate skill gaps.
        Prioritizes questions covering missing skills first, then matching difficulty.
        """
        missing_set = set(missing_skills)
        scored_questions = []

        for q in self.question_bank:
            q_skills = set(q.get("target_skills", []))
            
            # Intersection with identified candidate gaps
            gap_overlap = q_skills.intersection(missing_set)
            
            # Ranking score:
            # +10 points per matched skill gap
            # +2 points if question difficulty aligns
            # +1 point for topic relevance
            score = len(gap_overlap) * 10.0
            if q.get("difficulty") == preferred_difficulty:
                score += 2.0
            if len(q_skills) > 0:
                score += 1.0

            scored_questions.append({
                "score": score,
                "targeted_gaps": sorted(list(gap_overlap)),
                "question": q
            })

        # Sort descending by targeted gap relevance score
        scored_questions.sort(key=lambda x: x["score"], reverse=True)
        
        selected = []
        for item in scored_questions[:top_k]:
            q_data = dict(item["question"])
            q_data["targeted_skill_gaps"] = item["targeted_gaps"]
            selected.append(q_data)

        return selected

    def evaluate_candidate(
        self,
        resume_source: str,
        jd_source: str,
        num_questions: int = 4,
        difficulty: str = "Senior"
    ) -> Dict:
        """Full pipeline: match analysis and targeted question selection."""
        match_result = self.analyze_match(resume_source, jd_source)
        selected_questions = self.select_targeted_questions(
            missing_skills=match_result["missing_skills"],
            top_k=num_questions,
            preferred_difficulty=difficulty
        )
        return {
            "match_analysis": match_result,
            "targeted_interview_questions": selected_questions
        }


def export_matcher(output_path="exports/model3_matcher.joblib"):
    matcher = ResumeJobMatcher()
    out_file = Path(output_path)
    out_file.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(matcher, out_file)
    print(f"Saved Model 3 matcher pipeline to {out_file}")
    return matcher


if __name__ == "__main__":
    export_matcher()
