from django.core.management.base import BaseCommand
from forms.models import Category, Grade

class Command(BaseCommand):
    help = 'Initialize categories and grades'

    def handle(self, *args, **kwargs):
        # Create categories
        categories = [
            'Mathematics',
            'Science',
            'English',
            'Social Studies',
            'Computer Science',
            'History',
            'Geography',
            'Art',
            'Music',
            'Physical Education',
            'Foreign Language',
            'General Knowledge',
            'General Intelligence',
            'Logical Reasoning',
            'Quantitative Aptitude',
            'Verbal Ability',
            'Non-Verbal Ability'
        ]
        
        for category in categories:
            Category.objects.get_or_create(name=category)
            self.stdout.write(f'Created category: {category}')

        # Create grades
        grades = [
            'Grade 1',
            'Grade 2',
            'Grade 3',
            'Grade 4',
            'Grade 5',
            'Grade 6',
            'Grade 7',
            'Grade 8',
            'Grade 9',
            'Grade 10',
            'Grade 11',
            'Grade 12',
            'Diploma',
            'Undergraduate',
            'Postgraduate',
            'Others'
        ]
        
        for grade in grades:
            Grade.objects.get_or_create(name=grade)
            self.stdout.write(f'Created grade: {grade}')