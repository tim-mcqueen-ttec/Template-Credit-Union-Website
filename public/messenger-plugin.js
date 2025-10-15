const openPaths = [
    '/about/organizational/our-history',
    '/about/community/youth-center',
    '/loans/other-loans/personal-loan',
    '/about/membership/membership-eligibility',
    '/loans/credit-cards/diamond-rewards-visa-credit-card',
    '/loans/vehicle-loans/auto-loans'
];

const IDLE_TIMEOUT = 30 * 60 * 1000; // 30 minutes, 1800000 millis

const IGNORE_PATH = false;

Genesys('registerPlugin', 'MessengerVisibility', (Plugin) => {

    const isOpenPath = IGNORE_PATH 
        || openPaths.find(path => window.location.pathname.startsWith(path));
    console.log('Current path is', window.location.pathname, "and we're", isOpenPath ? "visible" : "not visible");

    // if (currentDay.open && isOpenHours && isOpenPath) {
    if (isOpenPath) {
        // The messenger is open and should be visible
        Plugin.subscribe('Launcher.ready', () => {
            Plugin.command('Launcher.show', {}, () => {
                console.log('Messenger is now visible');
            }, (e) => console.error('Error showing messenger:', e));
        });
    }

    Plugin.ready();

});


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

    plugin.subscribe('MessagingService.error', ({data}) => {
        console.error('MessagingService error event received:', data);
    });

    plugin.subscribe('MessagingService.started', () => {
        console.log('MessagingService.started event received');
        plugin.command('Launcher.show');
    });

    plugin.subscribe('MessagingService.sendingMessage', ({data}) => {
        console.log('MessagingService.sendingMessage event received:', data);
        if (data.message.events) { // event messages like 'Join', 'Typing', etc.
            return;
        }
        // console.debug('Message Received:', data);
        // if (sessionEnded) {
        //     return;
        // }
        lastMessage = new Date();
        clearTimeout(timer);
        timer = setTimeout(timeoutFired, IDLE_TIMEOUT)
        interval = setInterval(intervalFired, 60 * 1000)
        console.debug('Message sent - inactivity timer reset');
    })

    plugin.subscribe('MessagingService.conversationCleared', () => {
        console.log('MessagingService.conversationCleared event received');
        console.debug('Conversation cleared - stopping inactivity timer');
        clearTimeout(timer);
        clearInterval(interval);
        sessionEnded = true;
        console.debug('Session ended due to conversation cleared. Starting a new session in 5 seconds');
        setTimeout(() => {
            console.debug('Starting new conversation');
            plugin.command('MessagingService.startConversation');
        }, 5000);
    });

    console.debug('Session Timeout plugin loaded');
    plugin.ready();
});