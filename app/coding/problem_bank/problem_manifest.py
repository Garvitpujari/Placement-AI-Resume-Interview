"""
problem_manifest.py

Curated foundation problem bank for Placement AI.

This file defines the INITIAL 100 canonical coding problems
that Placement AI should research, enrich, validate, and
persist into PostgreSQL.

IMPORTANT:

- These are existing, established coding problems.
- We are NOT inventing new problems here.
- The wording may later be normalized during extraction.
- The underlying problem identity and algorithmic intuition
  must remain intact.
- LLM usage happens later in the seeding pipeline.
- This file contains NO database logic.
- This file contains NO web-search logic.
- This file contains NO candidate-selection logic.

The initial bank is intentionally limited to 100 problems.

Later:

    100
      ↓
    250
      ↓
    500
      ↓
    1000+

The selector will use the stored knowledge of these problems
to choose problems for individual candidates.
"""


# ==========================================================
# Problem Manifest
# ==========================================================

PROBLEM_MANIFEST = [

    # ======================================================
    # ARRAYS
    # ======================================================

    {
        "title": "Two Sum",
        "category": "Array",
        "difficulty": "Easy",
    },

    {
        "title": "Best Time to Buy and Sell Stock",
        "category": "Array",
        "difficulty": "Easy",
    },

    {
        "title": "Maximum Subarray",
        "category": "Array",
        "difficulty": "Medium",
    },

    {
        "title": "Product of Array Except Self",
        "category": "Array",
        "difficulty": "Medium",
    },

    {
        "title": "Maximum Product Subarray",
        "category": "Array",
        "difficulty": "Medium",
    },

    {
        "title": "Contains Duplicate",
        "category": "Array",
        "difficulty": "Easy",
    },

    {
        "title": "Majority Element",
        "category": "Array",
        "difficulty": "Easy",
    },

    {
        "title": "Merge Sorted Array",
        "category": "Array",
        "difficulty": "Easy",
    },

    {
        "title": "Rotate Array",
        "category": "Array",
        "difficulty": "Medium",
    },

    {
        "title": "Find the Duplicate Number",
        "category": "Array",
        "difficulty": "Medium",
    },


    # ======================================================
    # HASHING
    # ======================================================

    {
        "title": "Group Anagrams",
        "category": "Hashing",
        "difficulty": "Medium",
    },

    {
        "title": "Valid Anagram",
        "category": "Hashing",
        "difficulty": "Easy",
    },

    {
        "title": "Top K Frequent Elements",
        "category": "Hashing",
        "difficulty": "Medium",
    },

    {
        "title": "Longest Consecutive Sequence",
        "category": "Hashing",
        "difficulty": "Medium",
    },

    {
        "title": "Subarray Sum Equals K",
        "category": "Hashing",
        "difficulty": "Medium",
    },

    {
        "title": "Isomorphic Strings",
        "category": "Hashing",
        "difficulty": "Easy",
    },

    {
        "title": "Happy Number",
        "category": "Hashing",
        "difficulty": "Easy",
    },


    # ======================================================
    # TWO POINTERS
    # ======================================================

    {
        "title": "Valid Palindrome",
        "category": "Two Pointers",
        "difficulty": "Easy",
    },

    {
        "title": "Two Sum II - Input Array Is Sorted",
        "category": "Two Pointers",
        "difficulty": "Medium",
    },

    {
        "title": "3Sum",
        "category": "Two Pointers",
        "difficulty": "Medium",
    },

    {
        "title": "Container With Most Water",
        "category": "Two Pointers",
        "difficulty": "Medium",
    },

    {
        "title": "Trapping Rain Water",
        "category": "Two Pointers",
        "difficulty": "Hard",
    },

    {
        "title": "Move Zeroes",
        "category": "Two Pointers",
        "difficulty": "Easy",
    },

    {
        "title": "Remove Duplicates from Sorted Array",
        "category": "Two Pointers",
        "difficulty": "Easy",
    },


    # ======================================================
    # SLIDING WINDOW
    # ======================================================

    {
        "title": "Longest Substring Without Repeating Characters",
        "category": "Sliding Window",
        "difficulty": "Medium",
    },

    {
        "title": "Longest Repeating Character Replacement",
        "category": "Sliding Window",
        "difficulty": "Medium",
    },

    {
        "title": "Minimum Window Substring",
        "category": "Sliding Window",
        "difficulty": "Hard",
    },

    {
        "title": "Permutation in String",
        "category": "Sliding Window",
        "difficulty": "Medium",
    },

    {
        "title": "Find All Anagrams in a String",
        "category": "Sliding Window",
        "difficulty": "Medium",
    },

    {
        "title": "Maximum Average Subarray I",
        "category": "Sliding Window",
        "difficulty": "Easy",
    },


    # ======================================================
    # BINARY SEARCH
    # ======================================================

    {
        "title": "Binary Search",
        "category": "Binary Search",
        "difficulty": "Easy",
    },

    {
        "title": "Search in Rotated Sorted Array",
        "category": "Binary Search",
        "difficulty": "Medium",
    },

    {
        "title": "Find Minimum in Rotated Sorted Array",
        "category": "Binary Search",
        "difficulty": "Medium",
    },

    {
        "title": "Search a 2D Matrix",
        "category": "Binary Search",
        "difficulty": "Medium",
    },

    {
        "title": "Koko Eating Bananas",
        "category": "Binary Search",
        "difficulty": "Medium",
    },

    {
        "title": "Find Peak Element",
        "category": "Binary Search",
        "difficulty": "Medium",
    },

    {
        "title": "Median of Two Sorted Arrays",
        "category": "Binary Search",
        "difficulty": "Hard",
    },


    # ======================================================
    # STACK / QUEUE
    # ======================================================

    {
        "title": "Valid Parentheses",
        "category": "Stack",
        "difficulty": "Easy",
    },

    {
        "title": "Min Stack",
        "category": "Stack",
        "difficulty": "Medium",
    },

    {
        "title": "Evaluate Reverse Polish Notation",
        "category": "Stack",
        "difficulty": "Medium",
    },

    {
        "title": "Daily Temperatures",
        "category": "Stack",
        "difficulty": "Medium",
    },

    {
        "title": "Largest Rectangle in Histogram",
        "category": "Stack",
        "difficulty": "Hard",
    },

    {
        "title": "Implement Queue using Stacks",
        "category": "Queue",
        "difficulty": "Easy",
    },

    {
        "title": "Sliding Window Maximum",
        "category": "Queue",
        "difficulty": "Hard",
    },


    # ======================================================
    # LINKED LIST
    # ======================================================

    {
        "title": "Reverse Linked List",
        "category": "Linked List",
        "difficulty": "Easy",
    },

    {
        "title": "Merge Two Sorted Lists",
        "category": "Linked List",
        "difficulty": "Easy",
    },

    {
        "title": "Linked List Cycle",
        "category": "Linked List",
        "difficulty": "Easy",
    },

    {
        "title": "Remove Nth Node From End of List",
        "category": "Linked List",
        "difficulty": "Medium",
    },

    {
        "title": "Reorder List",
        "category": "Linked List",
        "difficulty": "Medium",
    },

    {
        "title": "Add Two Numbers",
        "category": "Linked List",
        "difficulty": "Medium",
    },

    {
        "title": "LRU Cache",
        "category": "Linked List",
        "difficulty": "Medium",
    },


    # ======================================================
    # TREES
    # ======================================================

    {
        "title": "Maximum Depth of Binary Tree",
        "category": "Trees",
        "difficulty": "Easy",
    },

    {
        "title": "Invert Binary Tree",
        "category": "Trees",
        "difficulty": "Easy",
    },

    {
        "title": "Same Tree",
        "category": "Trees",
        "difficulty": "Easy",
    },

    {
        "title": "Binary Tree Level Order Traversal",
        "category": "Trees",
        "difficulty": "Medium",
    },

    {
        "title": "Validate Binary Search Tree",
        "category": "Trees",
        "difficulty": "Medium",
    },

    {
        "title": "Lowest Common Ancestor of a Binary Tree",
        "category": "Trees",
        "difficulty": "Medium",
    },

    {
        "title": "Diameter of Binary Tree",
        "category": "Trees",
        "difficulty": "Easy",
    },

    {
        "title": "Kth Smallest Element in a BST",
        "category": "Trees",
        "difficulty": "Medium",
    },

    {
        "title": "Serialize and Deserialize Binary Tree",
        "category": "Trees",
        "difficulty": "Hard",
    },

    {
        "title": "Binary Tree Right Side View",
        "category": "Trees",
        "difficulty": "Medium",
    },


    # ======================================================
    # GRAPHS
    # ======================================================

    {
        "title": "Number of Islands",
        "category": "Graphs",
        "difficulty": "Medium",
    },

    {
        "title": "Clone Graph",
        "category": "Graphs",
        "difficulty": "Medium",
    },

    {
        "title": "Course Schedule",
        "category": "Graphs",
        "difficulty": "Medium",
    },

    {
        "title": "Course Schedule II",
        "category": "Graphs",
        "difficulty": "Medium",
    },

    {
        "title": "Pacific Atlantic Water Flow",
        "category": "Graphs",
        "difficulty": "Medium",
    },

    {
        "title": "Rotting Oranges",
        "category": "Graphs",
        "difficulty": "Medium",
    },

    {
        "title": "Word Ladder",
        "category": "Graphs",
        "difficulty": "Hard",
    },

    {
        "title": "Graph Valid Tree",
        "category": "Graphs",
        "difficulty": "Medium",
    },

    {
        "title": "Number of Connected Components in an Undirected Graph",
        "category": "Graphs",
        "difficulty": "Medium",
    },


    # ======================================================
    # HEAP / PRIORITY QUEUE
    # ======================================================

    {
        "title": "Kth Largest Element in an Array",
        "category": "Heap",
        "difficulty": "Medium",
    },

    {
        "title": "Merge K Sorted Lists",
        "category": "Heap",
        "difficulty": "Hard",
    },

    {
        "title": "Find Median from Data Stream",
        "category": "Heap",
        "difficulty": "Hard",
    },

    {
        "title": "K Closest Points to Origin",
        "category": "Heap",
        "difficulty": "Medium",
    },

    {
        "title": "Task Scheduler",
        "category": "Heap",
        "difficulty": "Medium",
    },


    # ======================================================
    # GREEDY
    # ======================================================

    {
        "title": "Jump Game",
        "category": "Greedy",
        "difficulty": "Medium",
    },

    {
        "title": "Jump Game II",
        "category": "Greedy",
        "difficulty": "Medium",
    },

    {
        "title": "Gas Station",
        "category": "Greedy",
        "difficulty": "Medium",
    },

    {
        "title": "Partition Labels",
        "category": "Greedy",
        "difficulty": "Medium",
    },

    {
        "title": "Merge Triplets to Form Target Triplet",
        "category": "Greedy",
        "difficulty": "Medium",
    },


    # ======================================================
    # BACKTRACKING
    # ======================================================

    {
        "title": "Subsets",
        "category": "Backtracking",
        "difficulty": "Medium",
    },

    {
        "title": "Permutations",
        "category": "Backtracking",
        "difficulty": "Medium",
    },

    {
        "title": "Combination Sum",
        "category": "Backtracking",
        "difficulty": "Medium",
    },

    {
        "title": "Word Search",
        "category": "Backtracking",
        "difficulty": "Medium",
    },


    # ======================================================
    # DYNAMIC PROGRAMMING
    # ======================================================

    {
        "title": "Climbing Stairs",
        "category": "Dynamic Programming",
        "difficulty": "Easy",
    },

    {
        "title": "House Robber",
        "category": "Dynamic Programming",
        "difficulty": "Medium",
    },

    {
        "title": "Coin Change",
        "category": "Dynamic Programming",
        "difficulty": "Medium",
    },

    {
        "title": "Longest Increasing Subsequence",
        "category": "Dynamic Programming",
        "difficulty": "Medium",
    },

    {
        "title": "Longest Common Subsequence",
        "category": "Dynamic Programming",
        "difficulty": "Medium",
    },

    {
        "title": "Word Break",
        "category": "Dynamic Programming",
        "difficulty": "Medium",
    },

    {
        "title": "0/1 Knapsack",
        "category": "Dynamic Programming",
        "difficulty": "Medium",
    },


    # ======================================================
    # MISCELLANEOUS / FUNDAMENTALS
    # ======================================================

    {
        "title": "Fizz Buzz",
        "category": "Fundamentals",
        "difficulty": "Easy",
    },

    {
        "title": "Palindrome Number",
        "category": "Fundamentals",
        "difficulty": "Easy",
    },

    {
        "title": "Reverse Integer",
        "category": "Fundamentals",
        "difficulty": "Medium",
    },

    {
        "title": "Roman to Integer",
        "category": "Fundamentals",
        "difficulty": "Easy",
    },

    {
        "title": "Integer to Roman",
        "category": "Fundamentals",
        "difficulty": "Medium",
    },

    {
        "title": "Valid Sudoku",
        "category": "Matrix",
        "difficulty": "Medium",
    },

    {
        "title": "Spiral Matrix",
        "category": "Matrix",
        "difficulty": "Medium",
    },

    {
        "title": "Rotate Image",
        "category": "Matrix",
        "difficulty": "Medium",
    },

    {
        "title": "Set Matrix Zeroes",
        "category": "Matrix",
        "difficulty": "Medium",
    },

  
]


# ==========================================================
# Manifest Validation
# ==========================================================

def validate_manifest():
    """
    Validate the curated manifest before the seeder uses it.
    """

    if len(PROBLEM_MANIFEST) != 100:

        raise ValueError(
            "Problem manifest must contain exactly "
            f"100 problems. Found: "
            f"{len(PROBLEM_MANIFEST)}"
        )

    required_fields = {
        "title",
        "category",
        "difficulty",
    }

    titles = set()

    for index, problem in enumerate(
        PROBLEM_MANIFEST,
        start=1,
    ):

        missing = (
            required_fields
            - set(problem.keys())
        )

        if missing:

            raise ValueError(
                f"Problem {index} is missing "
                f"fields: {missing}"
            )

        title = (
            problem["title"]
            .strip()
        )

        if not title:

            raise ValueError(
                f"Problem {index} has an empty title."
            )

        normalized_title = (
            title.lower()
        )

        if normalized_title in titles:

            raise ValueError(
                "Duplicate problem title: "
                f"{title}"
            )

        titles.add(
            normalized_title
        )

    return True


# ==========================================================
# Helpers
# ==========================================================

def get_problem_manifest():
    """
    Return a copy of the curated problem manifest.
    """

    return [
        dict(problem)
        for problem in PROBLEM_MANIFEST
    ]


def get_problem_count():
    """
    Return the number of curated problems.
    """

    return len(
        PROBLEM_MANIFEST
    )


# ==========================================================
# Category Summary
# ==========================================================

def get_category_summary():
    """
    Return the number of problems assigned to each
    category.
    """

    summary = {}

    for problem in PROBLEM_MANIFEST:

        category = problem[
            "category"
        ]

        summary[category] = (
            summary.get(
                category,
                0,
            )
            + 1
        )

    return summary


# ==========================================================
# Difficulty Summary
# ==========================================================

def get_difficulty_summary():
    """
    Return the number of problems assigned to each
    difficulty.
    """

    summary = {}

    for problem in PROBLEM_MANIFEST:

        difficulty = problem[
            "difficulty"
        ]

        summary[difficulty] = (
            summary.get(
                difficulty,
                0,
            )
            + 1
        )

    return summary


# ==========================================================
# Run Validation
# ==========================================================

if __name__ == "__main__":

    validate_manifest()

    print(
        "=" * 60
    )

    print(
        "PLACEMENT AI — PROBLEM MANIFEST"
    )

    print(
        "=" * 60
    )

    print(
        f"Total problems: "
        f"{get_problem_count()}"
    )

    print(
        "\nCategories:"
    )

    for category, count in (
        get_category_summary()
        .items()
    ):

        print(
            f"  {category}: {count}"
        )

    print(
        "\nDifficulties:"
    )

    for difficulty, count in (
        get_difficulty_summary()
        .items()
    ):

        print(
            f"  {difficulty}: {count}"
        )

    print(
        "\nManifest validation: PASSED"
    )