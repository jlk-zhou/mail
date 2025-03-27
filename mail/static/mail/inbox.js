document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-submit').addEventListener('click', () => {
    event.preventDefault(); 
    send_email(); 
  })

  // By default, load the inbox
  load_mailbox('inbox');
});

function send_email() {
  // Obtain results from the email compose form
  let recipients = document.querySelector('#compose-recipients').value;
  let subject = document.querySelector('#compose-subject').value;
  let body = document.querySelector('#compose-body').value; 

  // Post results to server
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
      if (!result.error) {
        load_mailbox('sent'); 
      }
  });

}


function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#read-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#read-view').style.display = 'none';

  // Show the mailbox name
  let mailboxName = mailbox.charAt(0).toUpperCase() + mailbox.slice(1)
  document.querySelector('#emails-view').innerHTML = `<h3>${mailboxName}</h3>`;

  // Obtain emails from corresponding mailboxes
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(email => {
      // Print email in console
      console.log(email);

      // Load emails
      // Tell user that the mailbox is empty if so
      if (email.length === 0) {
        const element = document.createElement('div'); 
        element.innerHTML = `<p> Your \"${mailboxName}\" mailbox is empty. </p>`;
        document.querySelector('#emails-view').append(element)
      }

      // If mailbox is non-empty, load the emails
      else {
        for (let i = 0; i < email.length; i++) {
          const element = document.createElement('div');
          let content = `
          <h5> From: ${email[i].sender} </h5>
          <p> Subject: ${email[i].subject} </p>
          <p> On: ${email[i].timestamp} </p>
          <hr>`; 
          element.innerHTML += `${content}`;

          // Clicking the emails should open them for user to read
          element.addEventListener('click', () => read_email(email[i].id)); 

          // Mark read emails with a grey background
          // This doesn't apply to the emails in the 'sent' inbox since
          // you must have sent what you read! 
          if (mailbox != 'sent') {
            if (email[i].read === true) {
              element.style.backgroundColor = '#E4E4E4'; 
            } else {
              element.style.backgroundColor = 'white'; 
            }
          }
          
          // Add Bootstrap CSS to the div
          element.classList.add('rounded', 'm-3', 'px-2', 'pt-2'); 
          
          // Attach this email div to the view
          document.querySelector('#emails-view').append(element);
        }
      }
    });

}

function read_email(id) {
  // Hide all other pages, which could only be the email view
  // since only through here you can open an email and read! 
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#read-view').style.display = 'block';

  // Obtain the actual content of the email
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
      // Print email
      console.log(email);

      // Render the email in the new page
      let content = `
      <h5> SUB: ${email.subject} </h5>
      <p> From: ${email.sender} </p>
      <p> To: ${email.recipients} </p>
      <p> On: ${email.timestamp} </p>
      <hr>
      <p> ${email.body} </p>
      `; 
      document.querySelector('#opened-email').innerHTML = `${content}`
  });; 

  // Mark the email as read
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })
}