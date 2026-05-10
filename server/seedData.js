export const DEPARTMENTS = [
  { id: 'CSE', name: 'CSE', fullName: 'Computer Science Engineering' },
  { id: 'IT',  name: 'IT',  fullName: 'Information Technology' },
];

export const ADMINS = [
  {
    id: 'u_a01',
    name: 'System Admin 01',
    email: 'adminschedulix01@gmail.com',
    password: 'adminsch123',
    role: 'admin',
  },
  {
    id: 'u_a02',
    name: 'System Admin 02',
    email: 'adminschedulix02@gmail.com',
    password: 'adminsch456',
    role: 'admin',
  },
];

export const FACULTIES = [
  { id: 'f1', userId: 'u_f01', name: 'Dr. Anu', designation: 'HOD', department: 'CSE', email: 'anu@gmail.com', password: 'anu_2016', subjects: ['CS401', 'CS402'], isHOD: true },
  { id: 'f2', userId: 'u_f03', name: 'Dr. Revathi', designation: 'Faculty', department: 'CSE', email: 'revathi@gmail.com', password: 'revathi_2018', subjects: ['CS405', 'CS406'] },
  { id: 'f3', userId: 'u_f05', name: 'Dr. Priya', designation: 'Faculty', department: 'CSE', email: 'priya@gmail.com', password: 'priya_2020', subjects: ['CS401', 'CS403'] },
  { id: 'f4', userId: 'u_f07', name: 'Dr. Sneha', designation: 'Faculty', department: 'CSE', email: 'sneha@gmail.com', password: 'sneha_2016', subjects: ['CS405', 'CS407'] },
  { id: 'f5', userId: 'u_f09', name: 'Dr. Divya', designation: 'Faculty', department: 'CSE', email: 'divya@gmail.com', password: 'divya_2018', subjects: ['CS401'] },
  { id: 'f6', userId: 'u_f11', name: 'Dr. Lakshmi', designation: 'Faculty', department: 'CSE', email: 'lakshmi@gmail.com', password: 'lakshmi_2020', subjects: ['CS403', 'CS404'] },
  { id: 'f7', userId: 'u_f13', name: 'Dr. Nithya', designation: 'Faculty', department: 'CSE', email: 'nithya@gmail.com', password: 'nithya_2016', subjects: ['CS406', 'CS408'] },
  { id: 'f8', userId: 'u_f15', name: 'Dr. Swetha', designation: 'Faculty', department: 'CSE', email: 'swetha@gmail.com', password: 'swetha_2018', subjects: ['CS402', 'CS403'] },
  { id: 'f9', userId: 'u_f17', name: 'Dr. Hari', designation: 'Faculty', department: 'CSE', email: 'hari@gmail.com', password: 'hari_2020', subjects: ['CS404', 'CS405'] },
  { id: 'f10', userId: 'u_f19', name: 'Dr. Sanjay', designation: 'Faculty', department: 'CSE', email: 'sanjay@gmail.com', password: 'sanjay_2016', subjects: ['CS401'] },
  { id: 'f11', userId: 'u_f02', name: 'Dr. Arun', designation: 'HOD', department: 'IT', email: 'arun@gmail.com', password: 'arun_2017', subjects: ['IT401', 'IT402'], isHOD: true },
  { id: 'f12', userId: 'u_f04', name: 'Dr. Kavi', designation: 'Faculty', department: 'IT', email: 'kavi@gmail.com', password: 'kavi_2019', subjects: ['IT407', 'IT408'] },
  { id: 'f13', userId: 'u_f06', name: 'Dr. Ramesh', designation: 'Faculty', department: 'IT', email: 'ramesh@gmail.com', password: 'ramesh_2015', subjects: ['IT403', 'IT404'] },
  { id: 'f14', userId: 'u_f08', name: 'Dr. Vijay', designation: 'Faculty', department: 'IT', email: 'vijay@gmail.com', password: 'vijay_2017', subjects: ['IT406', 'IT408'] },
  { id: 'f15', userId: 'u_f10', name: 'Dr. Karthik', designation: 'Faculty', department: 'IT', email: 'karthik@gmail.com', password: 'karthik_2019', subjects: ['IT402'] },
  { id: 'f16', userId: 'u_f12', name: 'Dr. Mohan', designation: 'Faculty', department: 'IT', email: 'mohan@gmail.com', password: 'mohan_2015', subjects: ['IT403', 'IT404'] },
  { id: 'f17', userId: 'u_f14', name: 'Dr. Prakash', designation: 'Faculty', department: 'IT', email: 'prakash@gmail.com', password: 'prakash_2017', subjects: ['IT407', 'IT408'] },
  { id: 'f18', userId: 'u_f16', name: 'Dr. Deepak', designation: 'Faculty', department: 'IT', email: 'deepak@gmail.com', password: 'deepak_2019', subjects: ['IT402', 'IT404'] },
  { id: 'f19', userId: 'u_f18', name: 'Dr. Meena', designation: 'Faculty', department: 'IT', email: 'meena@gmail.com', password: 'meena_2015', subjects: ['IT406', 'IT408'] },
  { id: 'f20', userId: 'u_f20', name: 'Dr. Shalini', designation: 'Faculty', department: 'IT', email: 'shalini@gmail.com', password: 'shalini_2017', subjects: ['IT402'] },
];

const RAW_STUDENT_CSV = `id,name,email,password,role,department,designation
24i201,Aarav Sharma,24i201@gmail.com,21FEB05,student,CSE,Student
24i202,Aditi Nair,24i202@gmail.com,24MAY05,student,CSE,Student
24i203,Arjun Patel,24i203@gmail.com,08MAR07,student,CSE,Student
24i204,Ananya Iyer,24i204@gmail.com,04NOV07,student,CSE,Student
24i205,Vihaan Gupta,24i205@gmail.com,18FEB07,student,CSE,Student
24i206,Ishani Reddy,24i206@gmail.com,14JAN05,student,CSE,Student
24i207,Sai Kumar,24i207@gmail.com,03APR05,student,CSE,Student
24i208,Diya Singh,24i208@gmail.com,17OCT05,student,CSE,Student
24i209,Reyansh Malhotra,24i209@gmail.com,18APR07,student,CSE,Student
24i210,Saanvi Rao,24i210@gmail.com,21DEC07,student,CSE,Student
24i211,Kavya Menon,24i211@gmail.com,14APR06,student,CSE,Student
24i212,Advait Joshi,24i212@gmail.com,19MAY05,student,CSE,Student
24i213,Myra Saxena,24i213@gmail.com,25MAR07,student,CSE,Student
24i214,Atharv Deshmukh,24i214@gmail.com,14JUN06,student,CSE,Student
24i215,Ishaan Bhat,24i215@gmail.com,05APR06,student,CSE,Student
24i216,Zara Khan,24i216@gmail.com,04FEB06,student,CSE,Student
24i217,Rohan Varma,24i217@gmail.com,04JUN06,student,CSE,Student
24i218,Kiara Kapoor,24i218@gmail.com,20MAY05,student,CSE,Student
24i219,Vivaan Shah,24i219@gmail.com,24AUG07,student,CSE,Student
24i220,Navya Bansal,24i220@gmail.com,04JUL05,student,CSE,Student
24i221,Kabir Chaudhary,24i221@gmail.com,18MAY07,student,CSE,Student
24i222,Anika Grewal,24i222@gmail.com,20JUN07,student,CSE,Student
24i223,Aryan Verma,24i223@gmail.com,07DEC05,student,CSE,Student
24i224,Sia Kulkarni,24i224@gmail.com,02NOV05,student,CSE,Student
24i225,Krish Sharma,24i225@gmail.com,25MAY05,student,CSE,Student
24i226,Shanaya Gill,24i226@gmail.com,28APR05,student,CSE,Student
24i227,Devansh Thakur,24i227@gmail.com,13MAY06,student,CSE,Student
24i228,Amara Pillai,24i228@gmail.com,21JUN05,student,CSE,Student
24i229,Ayan Mukherjee,24i229@gmail.com,12JUN05,student,CSE,Student
24i230,Inaya Bose,24i230@gmail.com,22MAY07,student,CSE,Student
24i231,Shreyas Iyer,24i231@gmail.com,22NOV05,student,CSE,Student
24i232,Tanisha Das,24i232@gmail.com,20NOV05,student,CSE,Student
24i233,Rishit Jain,24i233@gmail.com,18DEC05,student,CSE,Student
24i234,Prisha Agarwal,24i234@gmail.com,06AUG06,student,CSE,Student
24i235,Yuvan Mehra,24i235@gmail.com,09NOV07,student,CSE,Student
24i236,Anvi Chawla,24i236@gmail.com,18APR07,student,CSE,Student
24i237,Vedant Pandey,24i237@gmail.com,11JAN05,student,CSE,Student
24i238,Meher Malhotra,24i238@gmail.com,27JAN06,student,CSE,Student
24i239,Eshan Gupta,24i239@gmail.com,13MAY05,student,CSE,Student
24i240,Avni Bhatia,24i240@gmail.com,07OCT07,student,CSE,Student
24i241,Arush Sen,24i241@gmail.com,11APR07,student,CSE,Student
24i242,Kyra Sethi,24i242@gmail.com,16JUL07,student,CSE,Student
24i243,Ranveer Sodhi,24i243@gmail.com,15MAR06,student,CSE,Student
24i244,Pari Saxena,24i244@gmail.com,05APR07,student,CSE,Student
24i245,Samarth Joshi,24i245@gmail.com,18SEP06,student,CSE,Student
24i246,Riya Grover,24i246@gmail.com,24OCT06,student,CSE,Student
24i247,Nakul Chauhan,24i247@gmail.com,19JUL06,student,CSE,Student
24i248,Ishita Pal,24i248@gmail.com,08MAR07,student,CSE,Student
24i249,Madhav Taneja,24i249@gmail.com,16FEB05,student,CSE,Student
24i250,Kritika Roy,24i250@gmail.com,28FEB05,student,CSE,Student
24i301,Om Mishra,24i301@gmail.com,21MAR07,student,CSE,Student
24i302,Sejal Dubey,24i302@gmail.com,14OCT05,student,CSE,Student
24i303,Harsh Tripathi,24i303@gmail.com,13JUL07,student,CSE,Student
24i304,Nisha Shrivastav,24i304@gmail.com,15SEP06,student,CSE,Student
24i305,Aaryan Bhardwaj,24i305@gmail.com,18JAN07,student,CSE,Student
24i306,Tanvi Bhatt,24i306@gmail.com,24FEB07,student,CSE,Student
24i307,Daksh Negi,24i307@gmail.com,18MAY07,student,CSE,Student
24i308,Gauri Rawat,24i308@gmail.com,11FEB06,student,CSE,Student
24i309,Rudrash Yadav,24i309@gmail.com,14MAR06,student,CSE,Student
24i310,Sneha Tiwari,24i310@gmail.com,01DEC07,student,CSE,Student
24i311,Kartik Maurya,24i311@gmail.com,09SEP05,student,CSE,Student
24i312,Khushi Gupta,24i312@gmail.com,17FEB07,student,CSE,Student
24i313,Manav Shukla,24i313@gmail.com,10NOV07,student,CSE,Student
24i314,Janhvi Mishra,24i314@gmail.com,20APR05,student,CSE,Student
24i315,Siddharth Verma,24i315@gmail.com,12MAR07,student,CSE,Student
24i316,Alisha Singh,24i316@gmail.com,25SEP05,student,CSE,Student
24i317,Rishabh Dixit,24i317@gmail.com,20JUN06,student,CSE,Student
24i318,Isha Saxena,24i318@gmail.com,01FEB06,student,CSE,Student
24i319,Raghav Jha,24i319@gmail.com,27MAY05,student,CSE,Student
24i320,Bhavya Rana,24i320@gmail.com,02APR07,student,CSE,Student
24i321,Lakshya Chauhan,24i321@gmail.com,03FEB07,student,CSE,Student
24i322,Vidhi Mahajan,24i322@gmail.com,16FEB07,student,CSE,Student
24i323,Yuvraj Bhandari,24i323@gmail.com,25MAR05,student,CSE,Student
24i324,Priya Thakur,24i324@gmail.com,22AUG07,student,CSE,Student
24i325,Pranav Goswami,24i325@gmail.com,06MAY07,student,CSE,Student
24i326,Kashish Batra,24i326@gmail.com,28OCT06,student,CSE,Student
24i327,Aditya Sharma,24i327@gmail.com,07SEP07,student,CSE,Student
24i328,Meghna Kothari,24i328@gmail.com,23APR07,student,CSE,Student
24i329,Shaurya Bajaj,24i329@gmail.com,10JUL07,student,CSE,Student
24i330,Ananya Mittal,24i330@gmail.com,21JUN06,student,CSE,Student
24i331,Rohan Malhotra,24i331@gmail.com,17AUG05,student,CSE,Student
24i332,Sia Goel,24i332@gmail.com,08APR05,student,CSE,Student
24i333,Varun Bansal,24i333@gmail.com,11JAN07,student,CSE,Student
24i334,Ishita Jain,24i334@gmail.com,18APR07,student,CSE,Student
24i335,Kabir Khanna,24i335@gmail.com,08JAN05,student,CSE,Student
24i336,Manya Grover,24i336@gmail.com,23NOV05,student,CSE,Student
24i337,Arnav Chhabra,24i337@gmail.com,08FEB05,student,CSE,Student
24i338,Tara Kapur,24i338@gmail.com,28JUN05,student,CSE,Student
24i339,Aayush Bhalla,24i339@gmail.com,17APR06,student,CSE,Student
24i340,Riddhi Chopra,24i340@gmail.com,22AUG05,student,CSE,Student
24i341,Armaan Arora,24i341@gmail.com,18MAR07,student,CSE,Student
24i342,Navya Sood,24i342@gmail.com,19OCT06,student,CSE,Student
24i343,Reyansh Taneja,24i343@gmail.com,08AUG06,student,CSE,Student
24i344,Sana Oberoi,24i344@gmail.com,07FEB05,student,CSE,Student
24i345,Ayaan Mehra,24i345@gmail.com,22JUL06,student,CSE,Student
24i346,Kiyara Vohra,24i346@gmail.com,14JUL06,student,CSE,Student
24i347,Yash Singhania,24i347@gmail.com,28DEC05,student,CSE,Student
24i348,Myra Lamba,24i348@gmail.com,22NOV07,student,CSE,Student
24i349,Dhruv Kwatra,24i349@gmail.com,04JAN06,student,CSE,Student
24i350,Sara Pasricha,24i350@gmail.com,24JUN05,student,CSE,Student
24z201,Abhinav Iyer,24z201@gmail.com,08APR05,student,IT,Student
24z202,Amrita Nair,24z202@gmail.com,18AUG05,student,IT,Student
24z203,Bhuvan Pillai,24z203@gmail.com,14MAR06,student,IT,Student
24z204,Deepika Menon,24z204@gmail.com,15APR05,student,IT,Student
24z205,Gautam Reddy,24z205@gmail.com,15SEP05,student,IT,Student
24z206,Harini Krishnan,24z206@gmail.com,02NOV07,student,IT,Student
24z207,Indrajit Das,24z207@gmail.com,27JAN05,student,IT,Student
24z208,Jyoti Swaminathan,24z208@gmail.com,25APR05,student,IT,Student
24z209,Karthik Subramanian,24z209@gmail.com,14AUG06,student,IT,Student
24z210,Lakshmi Narayan,24z210@gmail.com,07JUL05,student,IT,Student
24z211,Manoj Kumar,24z211@gmail.com,06JUL05,student,IT,Student
24z212,Nandini Murthy,24z212@gmail.com,13MAY06,student,IT,Student
24z213,Pranav Venkatesh,24z213@gmail.com,10JUL07,student,IT,Student
24z214,Ramya Raghavan,24z214@gmail.com,24SEP07,student,IT,Student
24z215,Suresh Prabhu,24z215@gmail.com,23AUG05,student,IT,Student
24z216,Uma Maheshwari,24z216@gmail.com,07MAY05,student,IT,Student
24z217,Vikram Chandran,24z217@gmail.com,02OCT07,student,IT,Student
24z218,Yamini Balan,24z218@gmail.com,18JAN07,student,IT,Student
24z219,Arjun Seshadri,24z219@gmail.com,11JAN05,student,IT,Student
24z220,Bhavna Mani,24z220@gmail.com,19AUG07,student,IT,Student
24z221,Chaitanya Hegde,24z221@gmail.com,28SEP05,student,IT,Student
24z222,Divya Natarajan,24z222@gmail.com,02SEP05,student,IT,Student
24z223,Eshwar Moorthy,24z223@gmail.com,28MAR05,student,IT,Student
24z224,Gayathri Devi,24z224@gmail.com,20FEB07,student,IT,Student
24z225,Hariharan Iyer,24z225@gmail.com,28APR06,student,IT,Student
24z226,Ishwarya Ram,24z226@gmail.com,04OCT05,student,IT,Student
24z227,Jagan Mohan,24z227@gmail.com,19OCT05,student,IT,Student
24z228,Kalpana Chawla,24z228@gmail.com,20FEB06,student,IT,Student
24z229,Lokesh Babu,24z229@gmail.com,22OCT07,student,IT,Student
24z230,Meera Jasmine,24z230@gmail.com,17JUN06,student,IT,Student
24z231,Nikhil Gowda,24z231@gmail.com,07NOV07,student,IT,Student
24z232,Oviya Sundar,24z232@gmail.com,11APR06,student,IT,Student
24z233,Pawan Kalyan,24z233@gmail.com,13MAR07,student,IT,Student
24z234,Quila Rani,24z234@gmail.com,21MAY06,student,IT,Student
24z235,Rakesh Roshan,24z235@gmail.com,11FEB05,student,IT,Student
24z236,Sneha Ullal,24z236@gmail.com,15OCT07,student,IT,Student
24z237,Tarun Kumar,24z237@gmail.com,04FEB07,student,IT,Student
24z238,Usha Rani,24z238@gmail.com,07SEP06,student,IT,Student
24z239,Vijay Sethupathi,24z239@gmail.com,05JUN05,student,IT,Student
24z240,Wamiqa Gabbi,24z240@gmail.com,08JUN06,student,IT,Student
24z241,Xavier Raj,24z241@gmail.com,06AUG07,student,IT,Student
24z242,Yashwanth Desai,24z242@gmail.com,23MAY07,student,IT,Student
24z243,Zoya Akhtar,24z243@gmail.com,26NOV07,student,IT,Student
24z244,Ananth Pai,24z244@gmail.com,01NOV07,student,IT,Student
24z245,Bindu Madhavi,24z245@gmail.com,10NOV05,student,IT,Student
24z246,Chetan Bhagat,24z246@gmail.com,05MAY05,student,IT,Student
24z247,Dhanush Raja,24z247@gmail.com,04DEC07,student,IT,Student
24z248,Esha Deol,24z248@gmail.com,05MAY06,student,IT,Student
24z249,Farhan Akhtar,24z249@gmail.com,20APR07,student,IT,Student
24z250,Genelia Dsouza,24z250@gmail.com,11APR07,student,IT,Student
24z301,Karthik Aryan,24z301@gmail.com,21MAY07,student,IT,Student
24z302,Meenakshi Sundaram,24z302@gmail.com,16MAY05,student,IT,Student
24z303,Naveen Polishetty,24z303@gmail.com,03NOV06,student,IT,Student
24z304,Oindrila Sen,24z304@gmail.com,27MAY05,student,IT,Student
24z305,Prithviraj Sukumaran,24z305@gmail.com,01JUN05,student,IT,Student
24z306,Qasim Ali,24z306@gmail.com,21MAY05,student,IT,Student
24z307,Rashmika Mandanna,24z307@gmail.com,24AUG07,student,IT,Student
24z308,Suriya Sivakumar,24z308@gmail.com,23JUL07,student,IT,Student
24z309,Tamannaah Bhatia,24z309@gmail.com,01FEB05,student,IT,Student
24z310,Upendra Rao,24z310@gmail.com,23MAR07,student,IT,Student
24z311,Vijay Devarakonda,24z311@gmail.com,02JUN07,student,IT,Student
24z312,Waseem Khan,24z312@gmail.com,18MAR06,student,IT,Student
24z313,Xina Dhar,24z313@gmail.com,05JAN06,student,IT,Student
24z314,Yuvraj Singh,24z314@gmail.com,12JAN06,student,IT,Student
24z315,Zareen Khan,24z315@gmail.com,07NOV05,student,IT,Student
24z316,Abhi Ram,24z316@gmail.com,22FEB06,student,IT,Student
24z317,Bhavana Menon,24z317@gmail.com,25SEP06,student,IT,Student
24z318,Chiranjeevi Konidela,24z318@gmail.com,20DEC05,student,IT,Student
24z319,Dulquer Salmaan,24z319@gmail.com,08MAR05,student,IT,Student
24z320,Eesha Rebba,24z320@gmail.com,14JAN05,student,IT,Student
24z321,Fahadh Faasil,24z321@gmail.com,24JUN06,student,IT,Student
24z322,Gopichand T,24z322@gmail.com,26NOV07,student,IT,Student
24z323,Hansika Motwani,24z323@gmail.com,25MAR05,student,IT,Student
24z324,Indrajith Sukumaran,24z324@gmail.com,06DEC05,student,IT,Student
24z325,Jyothika Saravanan,24z325@gmail.com,13JAN06,student,IT,Student
24z326,Kamal Haasan,24z326@gmail.com,08APR06,student,IT,Student
24z327,Laxmi Raai,24z327@gmail.com,12MAY05,student,IT,Student
24z328,Mahesh Babu,24z328@gmail.com,08JAN07,student,IT,Student
24z329,Nayanthara Kurian,24z329@gmail.com,07JUL06,student,IT,Student
24z330,Owen Dsouza,24z330@gmail.com,09FEB06,student,IT,Student
24z331,Prabhas Raju,24z331@gmail.com,12NOV07,student,IT,Student
24z332,Qubra Sait,24z332@gmail.com,13NOV07,student,IT,Student
24z333,Rana Daggubati,24z333@gmail.com,11JAN05,student,IT,Student
24z334,Samantha Ruth,24z334@gmail.com,09MAR07,student,IT,Student
24z335,Trisha Krishnan,24z335@gmail.com,09JAN05,student,IT,Student
24z336,Unni Mukundan,24z336@gmail.com,20JUL06,student,IT,Student
24z337,Vikram Kennedy,24z337@gmail.com,24JUN06,student,IT,Student
24z338,Wamiqa Gabbi,24z338@gmail.com,20SEP05,student,IT,Student
24z339,Xavier Reddy,24z339@gmail.com,13OCT05,student,IT,Student
24z340,Yash Gowda,24z340@gmail.com,09JAN07,student,IT,Student
24z341,Zeenat Aman,24z341@gmail.com,14JAN07,student,IT,Student
24z342,Allu Arjun,24z342@gmail.com,26SEP07,student,IT,Student
24z343,Bala Krishna,24z343@gmail.com,24DEC07,student,IT,Student
24z344,Catherine Tresa,24z344@gmail.com,22APR06,student,IT,Student
24z345,Dhananjay Hegde,24z345@gmail.com,14FEB07,student,IT,Student
24z346,Erika Fernandes,24z346@gmail.com,11OCT06,student,IT,Student
24z347,Faria Abdullah,24z347@gmail.com,22FEB07,student,IT,Student
24z348,Ganesh Venkat,24z348@gmail.com,10SEP06,student,IT,Student
24z349,Hebah Patel,24z349@gmail.com,22JUL06,student,IT,Student
24z350,Iniya Raj,24z350@gmail.com,13DEC05,student,IT,Student
`;

const parseStudentsFromCsv = (csv) => {
  return csv.trim().split('\n').slice(1).map(line => {
    const parts = line.split(',');
    const [id, name, email, password, , department, maybeGroup, maybeDesignation] = parts;
    const group = parts.length === 8 ? maybeGroup : '';
    const designation = parts.length === 8 ? maybeDesignation : (maybeGroup || 'Student');
    const normalizedGroup = group ||
      (department === 'CSE'
        ? (id.startsWith('24z2') ? 'G1' : 'G2')
        : (id.startsWith('24i2') ? 'G1' : 'G2'));
    const section = `${department} ${normalizedGroup}`;

    return {
      id: `s_${id}`,
      userId: id,
      rollNumber: id,
      name,
      semester: 4,
      section,
      group: normalizedGroup,
      email,
      password,
      department,
    };
  });
};

export const STUDENTS = parseStudentsFromCsv(RAW_STUDENT_CSV);

export const SUBJECTS = [
  { id: 'CS401', subjectName: 'Data Structures and Algorithms', subjectCode: 'CS401', credits: 4, department: 'CSE', semester: 4, assignedFaculty: ['f1', 'f5', 'f9'], type: 'theory' },
  { id: 'CS402', subjectName: 'Database Management Systems', subjectCode: 'CS402', credits: 4, department: 'CSE', semester: 4, assignedFaculty: ['f1', 'f6', 'f10'], type: 'theory' },
  { id: 'CS403', subjectName: 'Operating Systems', subjectCode: 'CS403', credits: 3, department: 'CSE', semester: 4, assignedFaculty: ['f2', 'f5'], type: 'theory' },
  { id: 'CS404', subjectName: 'Computer Networks', subjectCode: 'CS404', credits: 3, department: 'CSE', semester: 4, assignedFaculty: ['f2', 'f6'], type: 'theory' },
  { id: 'CS405', subjectName: 'Software Engineering', subjectCode: 'CS405', credits: 3, department: 'CSE', semester: 4, assignedFaculty: ['f3', 'f7'], type: 'theory' },
  { id: 'CS406', subjectName: 'Web Technologies Lab', subjectCode: 'CS406', credits: 2, department: 'CSE', semester: 4, assignedFaculty: ['f3', 'f8'], type: 'lab' },
  { id: 'CS407', subjectName: 'DBMS Lab', subjectCode: 'CS407', credits: 2, department: 'CSE', semester: 4, assignedFaculty: ['f4', 'f7'], type: 'lab' },
  { id: 'CS408', subjectName: 'Python Programming', subjectCode: 'CS408', credits: 3, department: 'CSE', semester: 4, assignedFaculty: ['f4', 'f8'], type: 'theory' },
  { id: 'IT401', subjectName: 'Information Security', subjectCode: 'IT401', credits: 4, department: 'IT', semester: 4, assignedFaculty: ['f11', 'f15', 'f19'], type: 'theory' },
  { id: 'IT402', subjectName: 'Cloud Computing', subjectCode: 'IT402', credits: 4, department: 'IT', semester: 4, assignedFaculty: ['f11', 'f16', 'f20'], type: 'theory' },
  { id: 'IT403', subjectName: 'Mobile Application Development', subjectCode: 'IT403', credits: 3, department: 'IT', semester: 4, assignedFaculty: ['f12', 'f15'], type: 'theory' },
  { id: 'IT404', subjectName: 'Data Analytics', subjectCode: 'IT404', credits: 3, department: 'IT', semester: 4, assignedFaculty: ['f12', 'f16'], type: 'theory' },
  { id: 'IT405', subjectName: 'Internet of Things', subjectCode: 'IT405', credits: 3, department: 'IT', semester: 4, assignedFaculty: ['f13', 'f17'], type: 'theory' },
  { id: 'IT406', subjectName: 'Cloud Computing Lab', subjectCode: 'IT406', credits: 2, department: 'IT', semester: 4, assignedFaculty: ['f13', 'f18'], type: 'lab' },
  { id: 'IT407', subjectName: 'Mobile App Development Lab', subjectCode: 'IT407', credits: 2, department: 'IT', semester: 4, assignedFaculty: ['f14', 'f17'], type: 'lab' },
  { id: 'IT408', subjectName: 'Machine Learning Fundamentals', subjectCode: 'IT408', credits: 3, department: 'IT', semester: 4, assignedFaculty: ['f14', 'f18'], type: 'theory' },
];

export const CLASSROOMS = [
  { id: 'cr1', classroomNumber: 'CS-101', capacity: 60, status: 'available' },
  { id: 'cr2', classroomNumber: 'CS-102', capacity: 60, status: 'available' },
  { id: 'cr3', classroomNumber: 'CS-103', capacity: 60, status: 'available' },
  { id: 'cr4', classroomNumber: 'CS-104', capacity: 60, status: 'available' },
  { id: 'cr5', classroomNumber: 'IT-201', capacity: 60, status: 'available' },
  { id: 'cr6', classroomNumber: 'IT-202', capacity: 60, status: 'available' },
  { id: 'cr7', classroomNumber: 'IT-203', capacity: 60, status: 'available' },
  { id: 'cr8', classroomNumber: 'IT-204', capacity: 60, status: 'available' },
  { id: 'cr9', classroomNumber: 'LAB-301', capacity: 50, status: 'available' },
  { id: 'cr10', classroomNumber: 'LAB-302', capacity: 50, status: 'available' },
  { id: 'cr11', classroomNumber: 'LAB-303', capacity: 50, status: 'available' },
  { id: 'cr12', classroomNumber: 'LAB-304', capacity: 50, status: 'available' },
];

export const USERS = [
  ...ADMINS,
  ...FACULTIES.map(faculty => ({
    id: faculty.userId,
    name: faculty.name,
    email: faculty.email,
    password: faculty.password,
    role: faculty.isHOD ? 'hod' : 'faculty',
    department: faculty.department,
  })),
  ...STUDENTS.map(student => ({
    id: student.userId,
    name: student.name,
    email: student.email,
    password: student.password,
    role: 'student',
    department: student.department,
    section: student.section,
    group: student.group,
  })),
];
export const GROUPS = [
  { id: 'CSE G1', department: 'CSE', name: 'G1', semester: 4, studentIds: [] },
  { id: 'CSE G2', department: 'CSE', name: 'G2', semester: 4, studentIds: [] },
  { id: 'IT G1',  department: 'IT',  name: 'G1', semester: 4, studentIds: [] },
  { id: 'IT G2',  department: 'IT',  name: 'G2', semester: 4, studentIds: [] },
];
