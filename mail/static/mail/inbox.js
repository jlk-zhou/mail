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

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

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
          document.querySelector('#emails-view').append(element);
        }
      }
      
      // Make each individual email clickable
      // element.addEventListener('click', function() {
      //     console.log('This element has been clicked!')
      // });
      // document.querySelector('#emails-view').append(element);
  });
}