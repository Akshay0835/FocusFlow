const API_URL = 'http://localhost:5005/api/tasks';

async function runTests() {
  console.log('🚀 Starting Programmatic API Integration Tests...\n');
  
  let task1Id = null;
  let task2Id = null;

  try {
    // 1. Get initial tasks
    console.log('1. Fetching initial tasks...');
    const res1 = await fetch(API_URL);
    const tasks1 = await res1.json();
    console.log(`✅ Success: Fetched ${tasks1.length} task(s) initially.\n`);

    // 2. Test Form Validation (title too short)
    console.log('2. Testing backend validation (short title)...');
    const resVal = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'ab' }) // Should fail, minlength is 3
    });
    const valResult = await resVal.json();
    if (resVal.status === 400 && valResult.errors && valResult.errors.title) {
      console.log('✅ Success: Received expected 400 Validation Error:');
      console.log(`   Error Message: "${valResult.errors.title}"\n`);
    } else {
      throw new Error(`Failed validation test. Status: ${resVal.status}, Body: ${JSON.stringify(valResult)}`);
    }

    // 3. Create Task 1
    console.log('3. Creating Task 1 ("Review Design Specs" - High Priority)...');
    const resCreate1 = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Review Design Specs',
        description: 'Check Figma design mocks',
        priority: 'high'
      })
    });
    const task1 = await resCreate1.json();
    if (resCreate1.status === 201 && task1._id) {
      task1Id = task1._id;
      console.log(`✅ Success: Task 1 created with ID: ${task1Id}`);
      console.log(`   Priority: ${task1.priority}, Status: ${task1.status}\n`);
    } else {
      throw new Error(`Failed to create Task 1. Status: ${resCreate1.status}`);
    }

    // 4. Create Task 2
    console.log('4. Creating Task 2 ("Implement REST Endpoints" - Medium Priority)...');
    const resCreate2 = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Implement REST Endpoints',
        description: 'Write express.js CRUD routing',
        priority: 'medium',
        dueDate: new Date(Date.now() + 86400000).toISOString() // tomorrow
      })
    });
    const task2 = await resCreate2.json();
    if (resCreate2.status === 201 && task2._id) {
      task2Id = task2._id;
      console.log(`✅ Success: Task 2 created with ID: ${task2Id}`);
      console.log(`   Priority: ${task2.priority}, DueDate: ${task2.dueDate}\n`);
    } else {
      throw new Error(`Failed to create Task 2. Status: ${resCreate2.status}`);
    }

    // 5. Update Task 1 Status to completed
    console.log(`5. Toggling Task 1 Status to "completed" (ID: ${task1Id})...`);
    const resUpdate1 = await fetch(`${API_URL}/${task1Id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'completed' })
    });
    const task1Updated = await resUpdate1.json();
    if (resUpdate1.status === 200 && task1Updated.status === 'completed') {
      console.log(`✅ Success: Task 1 updated status to: ${task1Updated.status}\n`);
    } else {
      throw new Error(`Failed to update Task 1. Status: ${resUpdate1.status}`);
    }

    // 6. Update Task 2 Title and Description
    console.log(`6. Modifying Task 2 Details (ID: ${task2Id})...`);
    const resUpdate2 = await fetch(`${API_URL}/${task2Id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Refactor REST Endpoints to Node 25',
        description: 'Updated routes explanation'
      })
    });
    const task2Updated = await resUpdate2.json();
    if (resUpdate2.status === 200 && task2Updated.title === 'Refactor REST Endpoints to Node 25') {
      console.log(`✅ Success: Task 2 updated. New Title: "${task2Updated.title}"\n`);
    } else {
      throw new Error(`Failed to update Task 2. Status: ${resUpdate2.status}`);
    }

    // 7. Verify List Filters and Sorting
    console.log('7. Testing backend-side search query ("Refactor")...');
    const resSearch = await fetch(`${API_URL}?search=Refactor`);
    const searchResults = await resSearch.json();
    if (resSearch.status === 200 && searchResults.length === 1 && searchResults[0]._id === task2Id) {
      console.log(`✅ Success: Search query returned 1 matching task: "${searchResults[0].title}"\n`);
    } else {
      throw new Error(`Failed search filter test. Results: ${JSON.stringify(searchResults)}`);
    }

    // 8. Delete Task 1 (Cleanup)
    console.log(`8. Deleting Task 1 (ID: ${task1Id})...`);
    const resDelete1 = await fetch(`${API_URL}/${task1Id}`, { method: 'DELETE' });
    const delResult1 = await resDelete1.json();
    if (resDelete1.status === 200 && delResult1.id === task1Id) {
      console.log('✅ Success: Task 1 deleted.\n');
    } else {
      throw new Error(`Failed to delete Task 1. Status: ${resDelete1.status}`);
    }

    // 9. Delete Task 2 (Cleanup)
    console.log(`9. Deleting Task 2 (ID: ${task2Id})...`);
    const resDelete2 = await fetch(`${API_URL}/${task2Id}`, { method: 'DELETE' });
    const delResult2 = await resDelete2.json();
    if (resDelete2.status === 200 && delResult2.id === task2Id) {
      console.log('✅ Success: Task 2 deleted.\n');
    } else {
      throw new Error(`Failed to delete Task 2. Status: ${resDelete2.status}`);
    }

    // 10. Verify final task count is back to initial
    console.log('10. Fetching final task list to verify complete cleanup...');
    const resFinal = await fetch(API_URL);
    const tasksFinal = await resFinal.json();
    if (tasksFinal.length === tasks1.length) {
      console.log(`✅ Success: Final count matches initial count (${tasksFinal.length}). Cleanup complete.`);
    } else {
      throw new Error(`Cleanup failed. Tasks remaining: ${tasksFinal.length}`);
    }

    console.log('\n🎉 ALL API INTEGRATION TESTS PASSED SUCCESSFULLY! 🎉');

  } catch (error) {
    console.error(`\n❌ TEST FAILURE: ${error.message}`);
    process.exit(1);
  }
}

runTests();
