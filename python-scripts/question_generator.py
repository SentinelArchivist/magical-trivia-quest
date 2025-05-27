#!/usr/bin/env python3
"""
Tri-Force Trivia Quest - Question Generator

This script helps scrape factual data from fan wikis (Disney Wiki, Marvel Database Wiki, Wookieepedia)
and assists in generating trivia questions in JSON format for the game.

Note: This is for personal use only. The script focuses on extracting facts and transforming them into
original questions. This script should be used ethically and in compliance with websites' terms of service.
"""

import argparse
import json
import os
import random
import re
import time
from typing import Dict, List, Optional, Union, Any

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    print("Required packages not found. Installing...")
    import subprocess
    subprocess.check_call(["pip", "install", "requests", "beautifulsoup4"])
    import requests
    from bs4 import BeautifulSoup

# Wiki URLs
DISNEY_WIKI = "https://disney.fandom.com/wiki/"
MARVEL_WIKI = "https://marvel.fandom.com/wiki/"
STARWARS_WIKI = "https://starwars.fandom.com/wiki/"

# Output file
OUTPUT_FILE = "../data/questions.json"

class WikiScraper:
    """Class to handle wiki scraping operations"""
    
    def __init__(self, base_url: str, universe: str):
        self.base_url = base_url
        self.universe = universe
        self.session = requests.Session()
        # Set a user agent to be respectful
        self.session.headers.update({
            'User-Agent': 'TriviaQuestResearchBot/1.0 (Personal Educational Project)'
        })
    
    def get_page(self, page_name: str) -> Optional[BeautifulSoup]:
        """Fetch a wiki page and return BeautifulSoup object"""
        try:
            url = f"{self.base_url}{page_name.replace(' ', '_')}"
            print(f"Fetching {url}")
            
            response = self.session.get(url)
            response.raise_for_status()
            
            # Be respectful of the server
            time.sleep(1)
            
            return BeautifulSoup(response.text, 'html.parser')
        except Exception as e:
            print(f"Error fetching {page_name}: {e}")
            return None
    
    def extract_facts(self, soup: BeautifulSoup) -> List[str]:
        """Extract potential facts from a wiki page"""
        facts = []
        
        # Extract paragraphs (most factual content is in p tags)
        paragraphs = soup.find_all('p')
        for p in paragraphs:
            text = p.get_text().strip()
            if len(text) > 20:  # Ignore very short paragraphs
                # Clean up the text
                text = re.sub(r'\[\d+\]', '', text)  # Remove reference numbers like [1]
                text = re.sub(r'\s+', ' ', text)     # Normalize whitespace
                facts.append(text)
        
        # Extract lists which often contain facts
        lists = soup.find_all(['ul', 'ol'])
        for lst in lists:
            items = lst.find_all('li')
            for item in items:
                text = item.get_text().strip()
                if len(text) > 20:
                    text = re.sub(r'\[\d+\]', '', text)
                    text = re.sub(r'\s+', ' ', text)
                    facts.append(text)
        
        return facts

class QuestionGenerator:
    """Class to generate questions from facts"""
    
    def __init__(self):
        self.questions = []
    
    def create_true_false_question(self, fact: str, universe: str, difficulty: int) -> Dict[str, Any]:
        """Create a true/false question from a fact"""
        # For a real true/false question, we would need to sometimes modify the fact to make it false
        # For this example, we'll just use the fact as a true statement
        return {
            "questionText": fact,
            "questionType": "TrueFalse",
            "correctAnswer": "True",
            "universe": universe,
            "difficultyTier": difficulty
        }
    
    def create_multiple_choice_question(self, fact: str, correct_answer: str, 
                                        wrong_answers: List[str], universe: str, 
                                        difficulty: int) -> Dict[str, Any]:
        """Create a multiple choice question"""
        # Ensure we have exactly 3 wrong answers
        if len(wrong_answers) < 3:
            print("Warning: Not enough wrong answers provided")
            wrong_answers = wrong_answers + ["Unknown"] * (3 - len(wrong_answers))
        elif len(wrong_answers) > 3:
            wrong_answers = wrong_answers[:3]
            
        options = [correct_answer] + wrong_answers
        random.shuffle(options)
        
        return {
            "questionText": fact,
            "questionType": "MultipleChoice",
            "options": options,
            "correctAnswer": correct_answer,
            "universe": universe,
            "difficultyTier": difficulty
        }
    
    def generate_questions_from_facts(self, facts: List[str], universe: str) -> None:
        """Generate questions from a list of facts"""
        print(f"Generating questions for {len(facts)} facts from {universe} universe")
        
        for fact in facts:
            # Determine if this fact is suitable for a question
            # This would involve NLP in a sophisticated implementation
            # For simplicity, we'll just check if it contains certain patterns
            
            # Example: Look for "is a" or "was a" patterns for multiple choice
            match = re.search(r'([A-Za-z\s]+) (is|was) (a|an|the) ([A-Za-z\s]+)', fact)
            if match:
                subject = match.group(1).strip()
                predicate = match.group(4).strip()
                
                # Create a question
                question_text = f"What is {subject}?"
                correct_answer = predicate
                wrong_answers = ["Alternative 1", "Alternative 2", "Alternative 3"]  # Would be contextual in real implementation
                
                # Assign a random difficulty
                difficulty = random.randint(1, 5)
                
                question = self.create_multiple_choice_question(
                    question_text, correct_answer, wrong_answers, universe, difficulty
                )
                self.questions.append(question)
            else:
                # If no pattern matched, create a true/false question
                # In a real implementation, we would carefully craft these
                if len(fact) < 200:  # Avoid very long facts
                    difficulty = random.randint(1, 5)
                    question = self.create_true_false_question(fact, universe, difficulty)
                    self.questions.append(question)
    
    def save_questions(self, output_file: str) -> None:
        """Save generated questions to a JSON file"""
        try:
            # Create directory if it doesn't exist
            os.makedirs(os.path.dirname(os.path.abspath(output_file)), exist_ok=True)
            
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(self.questions, f, indent=2)
            
            print(f"Successfully saved {len(self.questions)} questions to {output_file}")
        except Exception as e:
            print(f"Error saving questions: {e}")

def manual_question_entry() -> List[Dict[str, Any]]:
    """Interface for manually entering questions"""
    questions = []
    print("\n=== Manual Question Entry ===")
    
    while True:
        print("\nEnter a new question (or press Enter to finish):")
        question_text = input("Question text: ").strip()
        if not question_text:
            break
        
        question_type = ""
        while question_type not in ["1", "2"]:
            question_type = input("Type (1 for True/False, 2 for Multiple Choice): ").strip()
        
        universe = ""
        while universe not in ["1", "2", "3"]:
            universe = input("Universe (1 for Disney, 2 for Marvel, 3 for Star Wars): ").strip()
        
        universe_map = {"1": "Disney", "2": "Marvel", "3": "StarWars"}
        selected_universe = universe_map[universe]
        
        difficulty = 0
        while difficulty < 1 or difficulty > 5:
            try:
                difficulty = int(input("Difficulty (1-5): ").strip())
            except ValueError:
                print("Please enter a number between 1 and 5")
        
        if question_type == "1":
            # True/False
            correct_answer = ""
            while correct_answer not in ["1", "2"]:
                correct_answer = input("Correct answer (1 for True, 2 for False): ").strip()
            
            answer_map = {"1": "True", "2": "False"}
            selected_answer = answer_map[correct_answer]
            
            questions.append({
                "questionText": question_text,
                "questionType": "TrueFalse",
                "correctAnswer": selected_answer,
                "universe": selected_universe,
                "difficultyTier": difficulty
            })
        else:
            # Multiple Choice
            options = []
            print("Enter 4 options:")
            for i in range(4):
                option = input(f"Option {i+1}: ").strip()
                options.append(option)
            
            correct_idx = 0
            while correct_idx < 1 or correct_idx > 4:
                try:
                    correct_idx = int(input("Which option is correct (1-4): ").strip())
                except ValueError:
                    print("Please enter a number between 1 and 4")
            
            questions.append({
                "questionText": question_text,
                "questionType": "MultipleChoice",
                "options": options,
                "correctAnswer": options[correct_idx-1],
                "universe": selected_universe,
                "difficultyTier": difficulty
            })
        
        print("Question added!")
    
    return questions

def main():
    """Main function"""
    parser = argparse.ArgumentParser(description="Tri-Force Trivia Quest Question Generator")
    parser.add_argument('--scrape', action='store_true', help='Scrape wikis for data')
    parser.add_argument('--manual', action='store_true', help='Manually enter questions')
    parser.add_argument('--output', type=str, default=OUTPUT_FILE, help='Output JSON file')
    parser.add_argument('--pages', nargs='+', help='Specific wiki pages to scrape')
    parser.add_argument('--universe', type=str, choices=['disney', 'marvel', 'starwars', 'all'], 
                      default='all', help='Universe to focus on')
    
    args = parser.parse_args()
    
    question_generator = QuestionGenerator()
    
    if args.scrape:
        universes = []
        if args.universe == 'all' or args.universe == 'disney':
            universes.append((DISNEY_WIKI, "Disney"))
        if args.universe == 'all' or args.universe == 'marvel':
            universes.append((MARVEL_WIKI, "Marvel"))
        if args.universe == 'all' or args.universe == 'starwars':
            universes.append((STARWARS_WIKI, "StarWars"))
        
        for base_url, universe in universes:
            scraper = WikiScraper(base_url, universe)
            
            pages = args.pages if args.pages else [
                "Mickey_Mouse",
                "Walt_Disney",
                "Disneyland"
            ]
            
            all_facts = []
            for page in pages:
                soup = scraper.get_page(page)
                if soup:
                    facts = scraper.extract_facts(soup)
                    all_facts.extend(facts)
                    print(f"Extracted {len(facts)} potential facts from {page}")
            
            question_generator.generate_questions_from_facts(all_facts, universe)
    
    if args.manual:
        manual_questions = manual_question_entry()
        question_generator.questions.extend(manual_questions)
    
    # If neither scrape nor manual, show help
    if not args.scrape and not args.manual:
        parser.print_help()
        return
    
    # Save questions if we have any
    if question_generator.questions:
        question_generator.save_questions(args.output)
    else:
        print("No questions generated.")

if __name__ == "__main__":
    main()
