"""
Generates synthetic dataset for Model 1: Candidate Response Evaluator prototyping.
"""
import json
import random
import pandas as pd
from pathlib import Path

SEED = 42
random.seed(SEED)

PROMPTS = [
    {
        "question_text": "Explain the difference between a process and a thread.",
        "reference_concepts": "address space, memory, context switch, IPC, lightweight, shared memory",
        "templates": [
            ("A process is an executing instance of a program with its own dedicated memory address space. Threads are lightweight execution units within a process that share the process's memory space and resources, making context switching cheaper.", 95, 90),
            ("A process has isolated memory, whereas threads run within a process sharing memory and state. Communication between processes requires IPC while threads can communicate via shared memory.", 88, 85),
            ("Process is a program. Thread is part of program. They both run code and do work in CPU.", 40, 50),
            ("A thread is a hardware component like RAM, and process is an operating system file stored on disk.", 10, 30),
            ("Processes have separate address space, thread shares address space. Context switch for threads is faster. IPC needed for process.", 82, 75)
        ]
    },
    {
        "question_text": "What is database indexing and how does a B-Tree index work?",
        "reference_concepts": "B-Tree, search complexity, O(log n), leaf nodes, disk I/O, write overhead, balance",
        "templates": [
            ("A database index is a data structure, typically a self-balancing B-Tree, that speeds up data retrieval to O(log n) time. Leaf nodes contain pointers or actual rows, reducing disk I/O at the cost of additional write overhead during inserts and updates.", 96, 92),
            ("Indexing uses B-Trees to keep data sorted and balanced. It allows logarithmic search times instead of full table scans, but slows down inserts and deletes.", 85, 85),
            ("Index is like a book index. It makes queries fast by storing keys in a tree.", 60, 65),
            ("An index stores every table column in memory so no queries ever touch the hard drive.", 25, 45),
            ("B-Tree index maintains balanced tree height, search is O(log n), reduces disk reads. Downside is slower writes.", 84, 80)
        ]
    },
    {
        "question_text": "How does HTTPS establish a secure connection using TLS/SSL?",
        "reference_concepts": "TLS handshake, asymmetric encryption, symmetric encryption, certificate, CA, session key",
        "templates": [
            ("HTTPS uses TLS. First, the client and server perform an asymmetric TLS handshake where the server presents a certificate signed by a trusted CA. They negotiate a shared symmetric session key for efficient, encrypted data transfer.", 95, 92),
            ("It starts with asymmetric encryption to authenticate the server certificate via a CA, then exchanges a symmetric session key used for encrypting subsequent traffic.", 88, 88),
            ("HTTPS encrypts everything using passwords sent back and forth between client and server.", 30, 40),
            ("The server sends a public key, client verifies certificate, generates session key, and uses symmetric cipher.", 80, 78),
            ("TLS secures the connection. It encrypts data so hackers can't intercept packets.", 55, 60)
        ]
    },
    {
        "question_text": "Describe the CAP theorem and its implications in distributed systems.",
        "reference_concepts": "Consistency, Availability, Partition tolerance, network partition, trade-off",
        "templates": [
            ("CAP theorem states that a distributed data store can simultaneously provide at most two of three guarantees: Consistency, Availability, and Partition tolerance. Since network partitions are inevitable in distributed networks, systems must choose between consistency (CP) or availability (AP).", 98, 95),
            ("In distributed systems network partitions will occur, so you trade off between consistency (every read gets latest write) and availability (every request gets a non-error response).", 90, 90),
            ("CAP stands for Consistency, Availability, Performance. You can only pick two of them.", 35, 40),
            ("When a network splits, you either reject requests to stay consistent or accept writes and risk stale reads.", 82, 85),
            ("CAP is about cloud databases. MongoDB is consistency, Cassandra is availability.", 60, 65)
        ]
    },
    {
        "question_text": "What is gradient descent and how does learning rate affect optimization?",
        "reference_concepts": "loss function, derivative, learning rate, overshoot, convergence, local minima",
        "templates": [
            ("Gradient descent is a first-order optimization algorithm that iteratively minimizes the loss function by moving in the direction of the negative gradient. A high learning rate causes divergence or overshooting, while an overly small rate leads to slow convergence or getting trapped in local minima.", 96, 92),
            ("It updates weights opposite to the gradient of the loss function. The learning rate controls step size: too large overshoots the minimum, too small converges too slowly.", 88, 88),
            ("Gradient descent finds the lowest point of a curve by calculating slopes. Learning rate is how fast it jumps.", 70, 75),
            ("Gradient descent trains neural networks by increasing accuracy every step. Learning rate is how many layers learn.", 25, 30),
            ("Iterative optimization based on gradient of loss. Large step size causes oscillations or divergence, small step size takes forever.", 84, 82)
        ]
    }
]

def generate_samples(n_target=250):
    rows = []
    while len(rows) < n_target:
        for prompt in PROMPTS:
            for template, base_tech, base_clarity in prompt["templates"]:
                # Add small realistic variations
                noise_t = random.randint(-4, 4)
                noise_c = random.randint(-4, 4)
                tech = max(0, min(100, base_tech + noise_t))
                clarity = max(0, min(100, base_clarity + noise_c))
                rows.append({
                    "id": f"cand_{len(rows)+1:04d}",
                    "question_text": prompt["question_text"],
                    "reference_concepts": prompt["reference_concepts"],
                    "candidate_answer": template,
                    "technical_score": float(tech),
                    "clarity_score": float(clarity)
                })
                if len(rows) >= n_target:
                    break
            if len(rows) >= n_target:
                break
    return pd.DataFrame(rows)

if __name__ == "__main__":
    out_dir = Path("data/raw")
    out_dir.mkdir(parents=True, exist_ok=True)
    df = generate_samples(300)
    out_file = out_dir / "interviews_sample.csv"
    df.to_csv(out_file, index=False)
    print(f"Generated {len(df)} samples at {out_file}")
