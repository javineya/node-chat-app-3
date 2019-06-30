// io() is minimum required to connect websocket to server
const socket                    =   io();
// elements
const $messageForm              =   document.querySelector('#message-form');
const $messageFormInput         =   $messageForm.querySelector('input');
const $messageFormButton        =   $messageForm.querySelector('button');
const $messages                 =   document.querySelector('#messages');

// mustache templates
const messageTemplate           =   document.querySelector('#message-template').innerHTML;
const sidebarTemplate           =   document.querySelector('#sidebar-template').innerHTML;

// options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoscroll = () => {
    // get new message element
    const $newMessage = $messages.lastElementChild;
    // get the height of new message element
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;
    // get visible height
    const visibleHeight = $messages.offsetHeight;
    // height of messages container
    const containerHeight = $messages.scrollHeight;
    // check scroll distance from top
    const scrollOffset = $messages.scrollTop + visibleHeight;
    // add logic to autoscroll
    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight;
    };
};

socket.on('message', (message) => {
    const html = Mustache.render(messageTemplate, { 
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('hh:mm a')
    });

    $messages.insertAdjacentHTML('beforeend', html);

    autoscroll();
});

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room, users
    });
    document.querySelector('#sidebar').innerHTML = html;
});

// listen for button in our HTML form
$messageForm.addEventListener('submit', (event) => {
    event.preventDefault();
    // disable form on send
    $messageFormButton.setAttribute('disabled', 'disabled');

    const message = event.target.elements.message.value;
    // send message to all connected clients
    socket.emit('sendMessage', message, (error) => {
        // enable form button
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value = '';
        $messageFormInput.focus();

        if (error) {
            return console.log(error);
        }
    });
});

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error);
        location.href = '/';
    }
});