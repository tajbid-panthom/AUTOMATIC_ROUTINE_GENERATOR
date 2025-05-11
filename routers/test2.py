import random
from reportlab.lib import colors
from reportlab.lib.pagesizes import A3
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
import sys
import json
class TimeSlot:
    def __init__(self, day, start_hour, end_hour):
        self.day = day
        self.start_hour = start_hour
        self.end_hour = end_hour

class Teacher:
    def __init__(self, name="", rank=999):
        self.name = name
        self.rank = rank
        self.preferences = []

    def add_preference(self, slot):
        self.preferences.append(slot)


class Course:
    def __init__(self, year="-1", code="", credit=-1.0, teacher_name="-1"):
        self.year = year
        self.code = code
        self.credit = credit
        self.teacher_name = teacher_name

    def is_sessional(self):
        try:
            return int(self.code[-1]) % 2 == 0
        except:
            return False
        
input_json = sys.argv[1]
data = json.loads(input_json)

course_list = data["courses"]
teacher_list = data["teachers"]
preferred_list = data["preferredTimes"]
year_list = data["years"]

    # print(course_list)
    # print(teacher_list)
    # print(preferred_list)
    # test += 1

class RoutineScheduler:
    def __init__(self):
        self.teachers = {}
        self.courses = []
        self.routine = {
            "Sunday": {}, "Monday": {}, "Tuesday": {}, "Wednesday": {}, "Thursday": {}
        }
        self.initialize_routine()

    def initialize_routine(self):
        time_slots = ["9-10", "10-11", "11-12", "12-1", "2-3", "3-4", "4-5"]
        years = []
        for y in year_list:
            years.append(y["year"])
        # for key in data :
        #     for val in data[key] :
        #         years.append(f"{key}({val})")
        # print(years[0])

        for day in self.routine:
            for year in years:
                self.routine[day][year] = {slot: Course() for slot in time_slots}

        # print(self.routine)

    def read_teachers(self):
        for t in teacher_list :
            self.teachers[t["name"]] = Teacher(t["name"], t["rank"])

    def read_preferences(self):
        for p in preferred_list :
            current_teacher = p["name"]
            parts = p["start_time"].split()
            day = p["day"]
            start_time = parts[0]
            start_period = parts[1]
            parts2 = p["end_time"].split()
            end_time = parts2[0]
            end_period = parts2[1]
                        
            start_hour = int(start_time.split(':')[0])
            if start_period == "PM" and start_hour != 12:
                start_hour += 12
            end_hour = int(end_time.split(':')[0])
            if end_period == "PM" and end_hour != 12:
                end_hour += 12
            
            if current_teacher in self.teachers:
                self.teachers[current_teacher].add_preference(
                    TimeSlot(day, start_hour, end_hour)
                )

    def read_courses(self):
        for c in course_list :
            self.courses.append(Course(f'{c["year"]}({c["term"]})', c["course_code"], c["credit"], c["name"]))

    def find_free_slot(self, teacher_name, day, year, count, exclude_slots=[]):
        if(count >= 3):
            return None

        for slot in self.routine[day][year]:
            if slot in exclude_slots:
                continue
            if self.routine[day][year][slot].code == "":
                conflict = False
                for y in self.routine[day]:
                    if self.routine[day][y][slot].teacher_name == teacher_name:
                        conflict = True
                        break
                if not conflict:
                    return slot
            else :
                existing_course = self.routine[day][year][slot]
                # existing_teacher_name = existing_course.teacher_name
                if(existing_course.is_sessional()) :
                    if self.shift_sessional_course(day, existing_course.year, slot):
                        return slot
                else:
                    if self.shift_existing_course(day, existing_course.year, slot, count+1):
                        return slot
        return None

    def shift_existing_course(self, day, year, time_slot, count):
        if(count >= 3) :
            return False

        existing_course = self.routine[day][year][time_slot]
        if existing_course.code == "":
            return True
        
        teacher_name = existing_course.teacher_name
        new_slot = self.find_free_slot(teacher_name, day, year, count, exclude_slots=[time_slot])
        if new_slot:
            self.routine[day][year][new_slot] = existing_course
            self.routine[day][year][time_slot] = Course()
            return True
        return False
    
    def shift_sessional_course(self, day, year, time_slot) :
        existing_course = self.routine[day][year][time_slot]

        i = 0
        str = ""
        while(time_slot[i] != '-') :
            str += time_slot[i]
            i = i+1

        st = int(str)
        # print(st)

        existing_teacher = existing_course.teacher_name
        existing_teacher = self.teachers.get(existing_course.teacher_name)
        preferred_times = list(set([pref for pref in existing_teacher.preferences]))
        random.shuffle(preferred_times)

        for pref in preferred_times:
            scheduled = False
            if (pref.start_hour <= 14 and pref.end_hour >= 14 and pref.end_hour <= 17) :
                # Start from 2 PM (14:00) and try to schedule until 5 PM (17:00)
                new_day = pref.day
                start = 14
                end = pref.end_hour
                count = 0
                initial_start = -1

                while start < end:
                    slot_label = f"{start-12}-{start+1-12}"  # Convert to 12-hour format
                    if slot_label not in self.routine[new_day][year]:
                        start += 1
                        continue

                    # Check if slot is empty and teacher is available
                    if self.routine[new_day][existing_course.year][slot_label].code == "":
                        if all(self.routine[new_day][year][slot_label].teacher_name != existing_teacher.name for year in self.routine[new_day]):
                            if initial_start == -1:
                                initial_start = start
                            count += 1
                        else:
                            count = 0
                            initial_start = -1
                    else:
                        count = 0
                        initial_start = -1

                    # If we found enough consecutive slots
                    if count == int(float(existing_course.credit)):
                        # Assign the existing_course to the consecutive slots
                        for i in range(int(float(existing_course.credit))):
                            assign_slot = f"{initial_start+i-12}-{initial_start+i+1-12}"
                            self.routine[new_day][existing_course.year][assign_slot] = existing_course
                        
                        for i in range(int(float(existing_course.credit))):
                            old_assign_slot = f"{st+i}-{st+i+1}"
                            # print(day, year, old_assign_slot)
                            self.routine[day][year][old_assign_slot] = Course()

                            # print(routine[day][year][old_assign_slot])
                        
                        scheduled = True
                        break

                    start += 1
            if scheduled :
                break

                
        if(not scheduled) :
            # Randomize the preferred day
            preferred_times = list(set([pref for pref in existing_teacher.preferences]))
            random.shuffle(preferred_times)
            
            for pref in preferred_times:
                new_day = pref.day
                start = pref.start_hour
                end = pref.end_hour
                count = 0
                initial_start = -1
                
                while start < end:
                    slot_label = f"{start if start<=12 else start-12}-{start+1 if start+1<=12 else start+1-12}"
                    if slot_label not in self.routine[new_day][existing_course.year]:
                        start += 1
                        continue
                    
                    if self.routine[new_day][existing_course.year][slot_label].code == "":
                        if all(self.routine[new_day][year][slot_label].teacher_name != existing_teacher.name for year in self.routine[new_day]):
                            if initial_start == -1:
                                initial_start = start
                            count += 1
                        else:
                            count = 0
                            initial_start = -1
                    else:
                        count = 0
                        initial_start = -1

                    if count == int(float(existing_course.credit)):
                        for i in range(int(float(existing_course.credit))):
                            assign_slot = f"{initial_start+i if initial_start+i<=12 else initial_start+i-12}-{initial_start+i+1 if initial_start+i+1<=12 else initial_start+i+1-12}"
                            self.routine[new_day][existing_course.year][assign_slot] = existing_course
                        
                        for i in range(int(float(existing_course.credit))):
                            old_assign_slot = f"{st+i}-{st+i+1}"
                            self.routine[day][year][old_assign_slot] = Course()
                        
                        scheduled = True
                        break
                    
                    start += 1
                    if start == 13:
                        start += 1
                        count = 0
                        initial_start = -1
                if scheduled:
                    break
            
            return scheduled


    def schedule_sessional_course(self, course):
        # ................................................................................
        teacher = self.teachers.get(course.teacher_name)
        if not teacher:
            return
        scheduled = False

        # Get teacher's preferred days
        preferred_times = list(set([pref for pref in teacher.preferences]))
        random.shuffle(preferred_times)  # Randomize the days to distribute courses evenly

        for pref in preferred_times:
            if (pref.start_hour <= 14 and pref.end_hour >= 14 and pref.end_hour <= 17) :
                # Start from 2 PM (14:00) and try to schedule until 5 PM (17:00)
                day = pref.day
                start = 14
                end = pref.end_hour
                count = 0
                initial_start = -1

                while start < end :
                    slot_label = f"{start-12}-{start+1-12}"  # Convert to 12-hour format
                    # if slot_label not in self.routine[day][course.year]:
                    #     start += 1
                    #     continue

                    # Check if slot is empty and teacher is available
                    if self.routine[day][course.year][slot_label].code == "":
                        if all(self.routine[day][year][slot_label].teacher_name != teacher.name for year in self.routine[day]):
                            if initial_start == -1:
                                initial_start = start
                            count += 1
                        else:
                            count = 0
                            initial_start = -1
                    else:
                        if self.routine[day][course.year][slot_label].is_sessional() :
                            if(self.shift_sessional_course(day, course.year, slot_label)) :
                                if all(self.routine[day][year][slot_label].teacher_name != teacher.name for year in self.routine[day]):
                                    if initial_start == -1:
                                        initial_start = start
                                    count += 1
                                else:
                                    count = 0
                                    initial_start = -1
                            else:
                                    count = 0
                                    initial_start = -1
                        else :
                            if(self.shift_existing_course(day, course.year, slot_label, 1)) :
                                if all(self.routine[day][year][slot_label].teacher_name != teacher.name for year in self.routine[day]):
                                    if initial_start == -1:
                                        initial_start = start
                                    count += 1
                                else:
                                    count = 0
                                    initial_start = -1
                            else:
                                count = 0
                                initial_start = -1
                        # count = 0
                        # initial_start = -1

                    # If we found enough consecutive slots
                    if count == int(float(course.credit)):
                        # Assign the course to the consecutive slots
                        for i in range(int(float(course.credit))):
                            assign_slot = f"{initial_start+i-12}-{initial_start+i+1-12}"
                            self.routine[day][course.year][assign_slot] = course
                        scheduled = True
                        break

                    start += 1

                if scheduled:
                    break
                # else :
                #     teacher = self.teachers.get(course.teacher_name)
        
        if(not scheduled) :
            # Randomize the preferred day (choose randomly from the teacher's preferred days)
            preferred_times = list(set([pref for pref in teacher.preferences]))  # Get unique preferred days
            random.shuffle(preferred_times)  # Shuffle the days to randomize
            
            for pref in preferred_times:
                day = pref.day
                start = pref.start_hour
                end = pref.end_hour
                count = 0
                initial_start = -1
                
                while start < end:
                    slot_label = f"{start if start<=12 else start-12}-{start+1 if start+1<=12 else start+1-12}"
                    # if slot_label not in self.routine[day][course.year]:
                    #     start += 1
                    #     continue
                    
                    if self.routine[day][course.year][slot_label].code == "":
                        if all(self.routine[day][year][slot_label].teacher_name != teacher.name for year in self.routine[day]):
                            if initial_start == -1:
                                initial_start = start
                            count += 1
                        else:
                            count = 0
                            initial_start = -1
                    else:
                        if self.routine[day][course.year][slot_label].is_sessional() :
                            if(self.shift_sessional_course(day, course.year, slot_label)) :
                                if all(self.routine[day][year][slot_label].teacher_name != teacher.name for year in self.routine[day]):
                                    if initial_start == -1:
                                        initial_start = start
                                    count += 1
                                else:
                                    count = 0
                                    initial_start = -1
                            else:
                                count = 0
                                initial_start = -1
                        else :
                            if(self.shift_existing_course(day, course.year, slot_label, 1)) :
                                if all(self.routine[day][year][slot_label].teacher_name != teacher.name for year in self.routine[day]):
                                    if initial_start == -1:
                                        initial_start = start
                                    count += 1
                                else:
                                    count = 0
                                    initial_start = -1
                            else:
                                count = 0
                                initial_start = -1
                        # count = 0
                        # initial_start = -1

                    if count == int(float(course.credit)):
                        for i in range(int(float(course.credit))):
                            assign_slot = f"{initial_start+i if initial_start+i<=12 else initial_start+i-12}-{initial_start+i+1 if initial_start+i+1<=12 else initial_start+i+1-12}"
                            self.routine[day][course.year][assign_slot] = course
                        scheduled = True
                        break
                    
                    start += 1
                    if start == 13:
                        start += 1
                        count = 0
                        initial_start = -1
                if scheduled:
                    break

        # ................................................................................
            

    def schedule_theory_course(self, course, count):
        teacher = self.teachers.get(course.teacher_name)
        if not teacher:
            return
        scheduled = False

        # Randomize the preferred day (choose randomly from the teacher's preferred days)
        preferred_times = list(set([pref for pref in teacher.preferences]))  # Get unique preferred days
        random.shuffle(preferred_times)  # Shuffle the days to randomize
        
        for pref in preferred_times:
            day = pref.day
            start = pref.start_hour
            end = pref.end_hour

            while start < end:
                slot_label = f"{start if start<=12 else start-12}-{start+1 if start+1<=12 else start+1-12}"

                # if slot_label not in self.routine[day][course.year]:
                #     start += 1
                #     continue
                
                if self.routine[day][course.year][slot_label].code == "":
                    if all(self.routine[day][year][slot_label].teacher_name != teacher.name for year in self.routine[day]):
                        self.routine[day][course.year][slot_label] = course
                        scheduled = True
                        break
                else:
                    if self.routine[day][course.year][slot_label].is_sessional() :
                        if(self.shift_sessional_course(day, course.year, slot_label)) :
                            if all(self.routine[day][year][slot_label].teacher_name != teacher.name for year in self.routine[day]):
                                self.routine[day][course.year][slot_label] = course
                                scheduled = True
                                break
                    else :
                        if(self.shift_existing_course(day, course.year, slot_label, 1)) :
                            if all(self.routine[day][year][slot_label].teacher_name != teacher.name for year in self.routine[day]):
                                self.routine[day][course.year][slot_label] = course
                                scheduled = True
                                break
                start += 1
                if start == 13:
                    start += 1
            if scheduled:
                return count+1
            else :
                return count

    def schedule_courses(self):
        # sessional = [c for c in self.courses if c.is_sessional()]
        # theory = [c for c in self.courses if not c.is_sessional()]

        self.courses.sort(key=lambda x: self.teachers.get(x.teacher_name, Teacher()).rank)
        # theory.sort(key=lambda x: self.teachers.get(x.teacher_name, Teacher()).rank)

        for c in self.courses :
            if(c.is_sessional()) :
                self.schedule_sessional_course(c)
            else :
                count = 0
                while(count < int(float(c.credit))) :
                    count = self.schedule_theory_course(c, count)
        # self.schedule_sessional_courses(sessional)
        # self.schedule_theory_courses(theory)

    def generate_pdf(self, filename):
        doc = SimpleDocTemplate(filename, pagesize=A3)
        elements = []

        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            spaceAfter=30
        )
        elements.append(Paragraph("Class Routine", title_style))

        time_slots = ["9-10", "10-11", "11-12", "12-1", "2-3", "3-4", "4-5"]
        years = []
        for y in year_list:
            years.append(y["year"])
        
        days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"]

        header = ["Day", "Year"] + time_slots
        data = [header]

        for day in days:
            first = True
            for year in years:
                row = [day if first else "", year]
                first = False
                for slot in time_slots:
                    course = self.routine[day][year][slot]
                    if course.code.strip():
                        row.append(f"{course.code}\n({course.teacher_name})")
                    else:
                        row.append("")
                data.append(row)

        table = Table(data, colWidths=[1*inch] + [1.3*inch] * 8)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.red),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('INNERGRID', (0,0), (-1,-1), 0.5, colors.black),
            ('BOX', (0,0), (-1,-1), 1, colors.black),
        ]))
        elements.append(table)
        doc.build(elements)

def run_scheduler():
    scheduler = RoutineScheduler()
    scheduler.read_teachers()
    scheduler.read_preferences()
    scheduler.read_courses()
    scheduler.schedule_courses()
    scheduler.generate_pdf("/Users/mdtajbidhossainbappi/Documents/SOFTWARE B/Real Time project/AUTOMATIC_ROUTINE_GENERATOR/public/routine.pdf")
    print("Routine has been generated and saved as 'routine.pdf'.")

if __name__ == "__main__":
    run_scheduler()
