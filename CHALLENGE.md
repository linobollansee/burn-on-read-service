# Coding Challenge: Burn on Read Service

## Definition of a Burn on Read Service

A burn on read service is a web service to automatically delete messages or content shortly after they have been viewed by the recipient.

## How it Works

1. **Sending**: A user sends a text message or file through the service.
2. **Link Generation**: The service generates an individual link and shares it with the user.
3. **Delivery & Viewing**: The recipient receives and opens the message.
4. **Automatic Deletion**: Once the message is opened, the service automatically deletes it from the server.

## Requirements

- Setup an Express.js application with TypeScript.
- Use Nunjucks for templates.
- Create your own CSS or a CSS framework of your choice.
  - Maybe it is time to give [PICO.CSS](https://picocss.com/) {target=”_top”} a shot ;) It's often a good choice to get an okayish base layout without tons of CSS classes.
- Provide a text field so that the user can fill it out.
  - Store the text content into a file.
  - Ensure that the user input gets `sanitized` before storing it to the file.
- After the file was created, show the user a link that could be shared with other people.
- Ensure that file gets destroyed after the link was visited.