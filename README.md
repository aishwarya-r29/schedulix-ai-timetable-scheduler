
  # AI Timetable Scheduler

  This is a code bundle for AI Timetable Scheduler. The original project is available at https://www.figma.com/design/KNaKFy0G7Yc1tj00U6aL2I/AI-Timetable-Scheduler.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.
  ## Administrator Workflows

  The AI Timetable Scheduler enforces strict **Institutional Data Integrity** to prevent "holes" in generated schedules. If you attempt to delete a Faculty member or a Classroom that is currently assigned to a timetable, the system will block the deletion and display a red conflict alert.
  
  To successfully delete these resources, please follow these workflows:

  ### 🧑‍🏫 Faculty Deletion Workflow
  If a faculty member is actively assigned to classes, you cannot delete them directly.
  1. **Read the Alert:** Note which class sections (e.g., `CSE G1`) are using the faculty member from the red alert popup.
  2. **Go to Generate Timetable:** Select the affected Department and Section in Step 1.
  3. **Re-Assign Faculty (Step 2):** Find the subject the faculty member is teaching. Click the dropdown and select a *different* teacher to take over the class.
  4. **Regenerate:** Click Generate to create the new timetable without the old teacher.
  5. **Delete:** Once all timetables using the old teacher have been regenerated or cleared, you can return to the Faculty Management module and safely delete them.

  ### 🏫 Classroom Deletion Workflow
  Because the AI automatically selects available rooms during generation, simply regenerating a timetable might cause the AI to pick the same room again. To guarantee exclusion:
  1. **Mark as Unavailable:** In the Classroom Management module, click **Edit** on the room you wish to delete and change its Status from `Available` to `Maintenance`.
  2. **Regenerate Timetables:** Go to the Generate Timetable module and regenerate the timetables for any groups that were using the room (as listed in the red alert). The AI will now completely ignore this room.
  3. **Delete:** Once the timetables are regenerated and the room is empty, return to the Classroom Management module and safely delete it.