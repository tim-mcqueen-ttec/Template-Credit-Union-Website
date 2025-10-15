const openHours = [
    { day: 'Sunday', open: false, start: 0, end: 0 }, // Closed Sunday
    { day: 'Monday', open: true, start: 8, end: 18 }, // Open Monday 8am to 6pm
    { day: 'Tuesday', open: true, start: 8, end: 18 }, // Open Tuesday 8am to 6pm
    { day: 'Wednesday', open: true, start: 8, end: 18 }, // Open Wednesday 8am to 6pm
    { day: 'Thursday', open: true, start: 8, end: 18 }, // Open Thursday 8am to 6pm
    { day: 'Friday', open: true, start: 8, end: 18 }, // Open Friday 8am to 6pm
    { day: 'Saturday', open: true, start: 9, end: 12 } // Open Saturday 9am to 12pm
];

const openPaths = [
    '/about/organizational/our-history',
    '/about/community/youth-center',
    // '/about',
    // '/contact'
];

const currentDate = new Date();
const januaryFirst = new Date(currentDate.getFullYear(), 0, 1);
const offsetOnJanuaryFirst = januaryFirst.getTimezoneOffset();
const offsetOnCurrentDate = currentDate.getTimezoneOffset();
const isDST = (offsetOnJanuaryFirst !== offsetOnCurrentDate);
const estOffset = (isDST) ? -4 : -5;
const utcDateStamp = currentDate.getTime() + (offsetOnCurrentDate * 60 * 1000);
const estDateStamp = utcDateStamp + (estOffset * 60 * 60 * 1000);
const estDate = new Date(estDateStamp);
console.log('Current EST time is', estDate.toLocaleString('en-US', { timeZone: 'America/New_York' }));
console.log('Current UTC time is', currentDate.toUTCString());
console.log('Current local time is', currentDate.toLocaleString());

const IDLE_TIMEOUT = 30 * 60 * 1000; // 30 minutes, 1800000 millis
// const IDLE_TIMEOUT = 2 * 60 * 1000; // 02 minutes, 120000 millis

const IGNORE_PATH = false;

// Genesys('registerPlugin', 'MessengerVisibility', (Plugin) => {

//     // const date = new Date();
//     const currentDay = openHours[estDate.getDay()];
//     console.log('Today day is', currentDay.day, "and we're", currentDay.open ? "open" : "closed");
//     const currentHour = estDate.getHours();
//     const isOpenHours = currentHour >= currentDay.start && currentHour < currentDay.end;
//     console.log('Current time is', estDate.toLocaleTimeString(), "and we're", isOpenHours ? "open" : "closed");
//     const isOpenPath = IGNORE_PATH || openPaths.includes(window.location.pathname);
//     console.log('Current path is', window.location.pathname, "and we're", isOpenPath ? "visible" : "not visible");

//     if (currentDay.open && isOpenHours && isOpenPath) {
//         // The messenger is open and should be visible
//         Plugin.subscribe('Launcher.ready', () => {
//             Plugin.command('Launcher.show', {}, () => {
//                 console.log('Messenger is now visible');
//             }, (e) => console.error('Error showing messenger:', e));
//         });
//     }

//     Plugin.ready();

// });


Genesys('registerPlugin', 'SessionTimeout', plugin => {
    let timer = 0;
    let interval = 0;
    let sessionEnded = false;
    let lastMessage = null;

    const intervalFired = () => {
        if (lastMessage) {
            const now = new Date();
            const diff = now - lastMessage;
            console.debug(`Inactivity check: ${Math.floor(diff / 60000)} minutes since last message (${lastMessage.toLocaleTimeString()})`);
        }
    };

    const timeoutFired = () => {
        clearTimeout(timer);
        clearInterval(interval);
        sessionEnded = true;
        console.debug('Messenger session timed out due to inactivity');
        plugin.command('MessagingService.sendMessage', {
            message: "Customer timed out due to inactivity"
        }, console.debug, console.error);
        plugin.command('MessagingService.clearConversation');
        plugin.command('Messenger.close');
        setTimeout(() => {
            alert('Chat session timed out due to inactivity');
            sessionEnded = false;
        }, 1000);
    }

    plugin.subscribe('MessagingService.ready', () => {
        console.log('MessagingService is ready - listening for events');
        plugin.subscribe('MessagingService.sendingMessage', ({data}) => {
            console.log('MessagingService.sendingMessage event received:', data);
            if (data.message.events) { // event messages like 'Join', 'Typing', etc.
                return;
            }
            // console.debug('Message Received:', data);
            if (sessionEnded) {
                return;
            }
            lastMessage = new Date();
            clearTimeout(timer);
            timer = setTimeout(timeoutFired, IDLE_TIMEOUT)
            interval = setInterval(intervalFired, 60 * 1000)
            console.debug('Message sent - inactivity timer reset');
        })
    });

    console.debug('Session Timeout plugin loaded');
    plugin.ready();
});