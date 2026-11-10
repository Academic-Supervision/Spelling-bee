import json
import os
import sys

raw_data = [
    # Grade 1
    {'file': 'Photos gr1 spelling bee/Ellias Saad2.jpg', 'grade': 1, 'name': 'Ellias Saad', 'section': 'Grade 1'},
    {'file': 'Photos gr1 spelling bee/Fahad AlObaid.jpg', 'grade': 1, 'name': 'Fahad Al-Obaid', 'section': 'Grade 1'},
    {'file': 'Photos gr1 spelling bee/Fahad Alkhaled2.jpg', 'grade': 1, 'name': 'Fahad Al-Khaled', 'section': 'Grade 1'},
    {'file': 'Photos gr1 spelling bee/Faris Alhumaidan.jpg', 'grade': 1, 'name': 'Faris Al-Humaidan', 'section': 'Grade 1'},
    {'file': 'Photos gr1 spelling bee/Khaled Rashoudi.jpg', 'grade': 1, 'name': 'Khaled Rashoudi', 'section': 'Grade 1'},
    {'file': 'Photos gr1 spelling bee/Mohamed Sultan2.jpg', 'grade': 1, 'name': 'Mohamed Sultan', 'section': 'Grade 1'},

    # Grade 2
    {'file': 'Spelling Bee - Grade 2/Abdulaziz Salman Al- Raimi (2D).jpg', 'grade': 2, 'name': 'Abdulaziz Salman Al-Raimi', 'section': '2D'},
    {'file': 'Spelling Bee - Grade 2/Faisal Mohammed Othman (2E).jpg', 'grade': 2, 'name': 'Faisal Mohammed Othman', 'section': '2E'},
    {'file': 'Spelling Bee - Grade 2/Faisal Mustafa Al-Humaidan (2B).jpg', 'grade': 2, 'name': 'Faisal Mustafa Al-Humaidan', 'section': '2B'},
    {'file': 'Spelling Bee - Grade 2/Muath Andulhameed Al-Anzi (2E).jpg', 'grade': 2, 'name': 'Muath Abdulhameed Al-Anzi', 'section': '2E'},
    {'file': 'Spelling Bee - Grade 2/Sattam Mishal Al-Shuraim (2A).jpg', 'grade': 2, 'name': 'Sattam Mishal Al-Shuraim', 'section': '2A'},
    {'file': 'Spelling Bee - Grade 2/Tamim Bin Ahmed Al-Mutairi (2D).jpg', 'grade': 2, 'name': 'Tamim Bin Ahmed Al-Mutairi', 'section': '2D'},
    {'file': 'Spelling Bee - Grade 2/Yazid Malek Al-Saleh (2B).jpg', 'grade': 2, 'name': 'Yazid Malek Al-Saleh', 'section': '2B'},
    {'file': 'Spelling Bee - Grade 2/Yousef Ibrahim Samman (2D).jpg', 'grade': 2, 'name': 'Yousef Ibrahim Samman', 'section': '2D'},

    # Grade 3
    {'file': 'Grade 3 Photos Spelling Bee/Abdulah Al-Subaie.jpg', 'grade': 3, 'name': 'Abdullah Al-Subaie', 'section': 'Grade 3'},
    {'file': 'Grade 3 Photos Spelling Bee/Bader Al-Abad.jpg', 'grade': 3, 'name': 'Bader Al-Abad', 'section': 'Grade 3'},
    {'file': 'Grade 3 Photos Spelling Bee/Fahad Al-Moqbil.jpg', 'grade': 3, 'name': 'Fahad Al-Moqbil', 'section': 'Grade 3'},
    {'file': 'Grade 3 Photos Spelling Bee/Faisal Al-Zahrani.jpg', 'grade': 3, 'name': 'Faisal Al-Zahrani', 'section': 'Grade 3'},
    {'file': 'Grade 3 Photos Spelling Bee/Ibrahim Shabeeb.jpg', 'grade': 3, 'name': 'Ibrahim Shabeeb', 'section': 'Grade 3'},
    {'file': 'Grade 3 Photos Spelling Bee/Mohammed Al-Qahtani.jpg', 'grade': 3, 'name': 'Mohammed Al-Qahtani', 'section': 'Grade 3'},
    {'file': 'Grade 3 Photos Spelling Bee/Omar Mazen.jpg', 'grade': 3, 'name': 'Omar Mazen', 'section': 'Grade 3'},

    # Grade 4
    {'file': 'Round 3 - Grade 4 - 1448/عبدالله الغامدي رابع ج_.jpg', 'grade': 4, 'name': 'Abdullah Al-Ghamdi', 'name_ar': 'عبدالله الغامدي', 'section': '4C (رابع ج)'},
    {'file': 'Round 3 - Grade 4 - 1448/عبدالله التويجري رابع هاء_.jpg', 'grade': 4, 'name': 'Abdullah Al-Tuwaijri', 'name_ar': 'عبدالله التويجري', 'section': '4E (رابع هـ)'},
    {'file': 'Round 3 - Grade 4 - 1448/علي المحيسن رابع ب_.jpg', 'grade': 4, 'name': 'Ali Al-Muhaisen', 'name_ar': 'علي المحيسن', 'section': '4B (رابع ب)'},
    {'file': 'Round 3 - Grade 4 - 1448/Dawood Khalid 4A.jpg', 'grade': 4, 'name': 'Dawood Khalid', 'name_ar': '', 'section': '4A'},
    {'file': 'Round 3 - Grade 4 - 1448/فهد المانع رابع د_.jpg', 'grade': 4, 'name': 'Fahad Al-Manea', 'name_ar': 'فهد المانع', 'section': '4D (رابع د)'},
    {'file': 'Round 3 - Grade 4 - 1448/حمد حمدان رابع و_.jpg', 'grade': 4, 'name': 'Hamad Hamdan', 'name_ar': 'حمد حمدان', 'section': '4F (رابع و)'},
    {'file': 'Round 3 - Grade 4 - 1448/Hamza Talal 4A.jpg', 'grade': 4, 'name': 'Hamza Talal', 'name_ar': '', 'section': '4A'},
    {'file': 'Round 3 - Grade 4 - 1448/خالد العتيبي رابع د_.jpg', 'grade': 4, 'name': 'Khalid Al-Otaibi', 'name_ar': 'خالد العتيبي', 'section': '4D (رابع د)'},
    {'file': 'Round 3 - Grade 4 - 1448/Omar Abo-Alhana 4A.jpg', 'grade': 4, 'name': 'Omar Abo-Alhana', 'name_ar': '', 'section': '4A'},
    {'file': 'Round 3 - Grade 4 - 1448/سليمان السليمان رابع ب_.jpg', 'grade': 4, 'name': 'Sulaiman Al-Sulaiman', 'name_ar': 'سليمان السليمان', 'section': '4B (رابع ب)'},
    {'file': 'Round 3 - Grade 4 - 1448/تركي البكر رابع ج_.jpg', 'grade': 4, 'name': 'Turki Al-Bikr', 'name_ar': 'تركي البكر', 'section': '4C (رابع ج)'},
    {'file': 'Round 3 - Grade 4 - 1448/يوسف زيتون رابع د_.jpg', 'grade': 4, 'name': 'Yousef Zaitoun', 'name_ar': 'يوسف زيتون', 'section': '4D (رابع د)'},

    # Grade 5
    {'file': 'Grade 5 Spelling Bee Champions/Abdulaziz Al-Ghamdi .jpeg', 'grade': 5, 'name': 'Abdulaziz Al-Ghamdi', 'section': 'Grade 5'},
    {'file': 'Grade 5 Spelling Bee Champions/Abdullah Almulhim.jpeg', 'grade': 5, 'name': 'Abdullah Almulhim', 'section': 'Grade 5'},
    {'file': 'Grade 5 Spelling Bee Champions/Abdullah Bajandouh.jpeg', 'grade': 5, 'name': 'Abdullah Bajandouh', 'section': 'Grade 5'},
    {'file': 'Grade 5 Spelling Bee Champions/Abdullah Qasti.jpeg', 'grade': 5, 'name': 'Abdullah Qasti', 'section': 'Grade 5'},
    {'file': 'Grade 5 Spelling Bee Champions/Abdulrahman Waqi_ Allah.jpeg', 'grade': 5, 'name': 'Abdulrahman Waqi Allah', 'section': 'Grade 5'},
    {'file': 'Grade 5 Spelling Bee Champions/Ahmad Alsalfan.jpeg', 'grade': 5, 'name': 'Ahmad Alsalfan', 'section': 'Grade 5'},
    {'file': 'Grade 5 Spelling Bee Champions/5A/Ahmed Turki Asiri.png', 'grade': 5, 'name': 'Ahmed Turki Asiri', 'section': '5A'},
    {'file': 'Grade 5 Spelling Bee Champions/Bassam Alabbad .jpeg', 'grade': 5, 'name': 'Bassam Alabbad', 'section': 'Grade 5'},
    {'file': 'Grade 5 Spelling Bee Champions/Fahad Al-Mahna.jpeg', 'grade': 5, 'name': 'Fahad Al-Mahna', 'section': 'Grade 5'},
    {'file': 'Grade 5 Spelling Bee Champions/5A/Fahad Badr Jassim Al-Khulaiwi.png', 'grade': 5, 'name': 'Fahad Badr Jassim Al-Khulaiwi', 'section': '5A'},
    {'file': 'Grade 5 Spelling Bee Champions/Faisal Alsanea.jpeg', 'grade': 5, 'name': 'Faisal Alsanea', 'section': 'Grade 5'},
    {'file': 'Grade 5 Spelling Bee Champions/Faisal Elahi.jpeg', 'grade': 5, 'name': 'Faisal Elahi', 'section': 'Grade 5'},
    {'file': 'Grade 5 Spelling Bee Champions/Hassan Attiyah.jpeg', 'grade': 5, 'name': 'Hassan Attiyah', 'section': 'Grade 5'},
    {'file': 'Grade 5 Spelling Bee Champions/Khalid Alkhaldi.jpeg', 'grade': 5, 'name': 'Khalid Alkhaldi', 'section': 'Grade 5'},
    {'file': 'Grade 5 Spelling Bee Champions/Khalid Alsamail .jpeg', 'grade': 5, 'name': 'Khalid Alsamail', 'section': 'Grade 5'},
    {'file': 'Grade 5 Spelling Bee Champions/5A/Mishari Dhuwayan Mohamed.png', 'grade': 5, 'name': 'Mishari Dhuwayan Mohamed', 'section': '5A'},
    {'file': 'Grade 5 Spelling Bee Champions/Mohamed Waqi_ Allah.jpeg', 'grade': 5, 'name': 'Mohamed Waqi Allah', 'section': 'Grade 5'},
    {'file': 'Grade 5 Spelling Bee Champions/Obai Hakeem (2).jpeg', 'grade': 5, 'name': 'Obai Hakeem', 'section': 'Grade 5'},
    {'file': 'Grade 5 Spelling Bee Champions/5A/Salman Faisal Saad Al_Dosary.png', 'grade': 5, 'name': 'Salman Faisal Saad Al-Dosary', 'section': '5A'},
    {'file': 'Grade 5 Spelling Bee Champions/Saud Aldulaijan.jpeg', 'grade': 5, 'name': 'Saud Aldulaijan', 'section': 'Grade 5'},
    {'file': 'Grade 5 Spelling Bee Champions/Yousef Tayeb.jpeg', 'grade': 5, 'name': 'Yousef Tayeb', 'section': 'Grade 5'},

    # Grade 6
    {'file': 'Spellers 2026 -Grade 6/6B/Abdelaziz Faisal Almulhim.png', 'grade': 6, 'name': 'Abdelaziz Faisal Almulhim', 'section': '6B'},
    {'file': 'Spellers 2026 -Grade 6/Belal Khalil 6 D.jpg', 'grade': 6, 'name': 'Belal Khalil', 'section': '6D'},
    {'file': 'Spellers 2026 -Grade 6/6A/Emad Wael Riyad Masri.png', 'grade': 6, 'name': 'Emad Wael Riyad Masri', 'section': '6A'},
    {'file': 'Spellers 2026 -Grade 6/Fahad Abdallah 6D.jpg', 'grade': 6, 'name': 'Fahad Abdallah', 'section': '6D'},
    {'file': 'Spellers 2026 -Grade 6/6B/Khalid Abdullah Hassan Alqahtani.png', 'grade': 6, 'name': 'Khalid Abdullah Hassan Alqahtani', 'section': '6B'},
    {'file': 'Spellers 2026 -Grade 6/6B/Khalid Nassar Khalid Al-Rumaihi.png', 'grade': 6, 'name': 'Khalid Nassar Khalid Al-Rumaihi', 'section': '6B'},
    {'file': 'Spellers 2026 -Grade 6/6B/Yazan Nezar Adnan.png', 'grade': 6, 'name': 'Yazan Nezar Adnan', 'section': '6B'},
    {'file': 'Spellers 2026 -Grade 6/6A/Mahmoud Bayan Abaza.png', 'grade': 6, 'name': 'Mahmoud Bayan Abaza', 'section': '6A'},
    {'file': 'Spellers 2026 -Grade 6/Salman Al-mesabah 6F.jpg', 'grade': 6, 'name': 'Salman Al-mesabah', 'section': '6F'},
    {'file': 'Spellers 2026 -Grade 6/Saud Waleed 6c.jpg', 'grade': 6, 'name': 'Saud Waleed', 'section': '6C'},
    {'file': 'Spellers 2026 -Grade 6/Soliman  Osama 6C.jpg', 'grade': 6, 'name': 'Soliman Osama', 'section': '6C'},
    {'file': 'Spellers 2026 -Grade 6/6A/Sultan Faisal Abdulhamid Al-Dubaikel.png', 'grade': 6, 'name': 'Sultan Faisal Abdulhamid Al-Dubaikel', 'section': '6A'},
    {'file': 'Spellers 2026 -Grade 6/Talal Omar 6C.jpg', 'grade': 6, 'name': 'Talal Omar', 'section': '6C'},
    {'file': 'Spellers 2026 -Grade 6/Zaid Al-Zabt 6F.jpg', 'grade': 6, 'name': 'Zaid Al-Zabt', 'section': '6F'},
]

for item in raw_data:
    if not os.path.exists(item['file']):
        raise FileNotFoundError(f"File not found: {item['file']}")

# Group and ensure strictly alphabetical order in each grade
grouped = {}
for g in range(1, 7):
    items = [x for x in raw_data if x['grade'] == g]
    items.sort(key=lambda x: x['name'].lower())
    grouped[g] = items

all_spellers = []
id_cnt = 1
for g in range(1, 7):
    for sp in grouped[g]:
        sp['id'] = id_cnt
        id_cnt += 1
        all_spellers.append(sp)

with open('students_data.json', 'w', encoding='utf-8') as f:
    json.dump(all_spellers, f, ensure_ascii=False, indent=2)

with open('students_data.js', 'w', encoding='utf-8') as f:
    f.write('const STUDENTS_DATA = ' + json.dumps(all_spellers, ensure_ascii=False, indent=2) + ';\n')

print(f"Total processed spellers: {len(all_spellers)}")
for g in range(1, 7):
    print(f"Grade {g}: {len(grouped[g])} spellers (A to Z: '{grouped[g][0]['name']}' -> '{grouped[g][-1]['name']}')")
