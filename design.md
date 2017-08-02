# Design

react-conf-webrtc is designed to be flexible enough to support your signaling system. In order to accomplish this
react-conf-webrtc uses an event system with well-defined messages that you can send and expect to receive.

Out of the box, react-conf-webrtc ships with an adapter for the Spreed RTC signaling events. This adapter acts
as a middleman between the Spreed WebSocket server events and the conference room and translates them to be
compatible with the react-conf-webrtc API and vice versa.

The SpreedAdapter internally will queue the messages if there are no messages available. This is necessary because
of the delay between connecting to the server and the initialization of the react-conf-webrtc component.

In addition to the SpreedAdapter class, react-conf-webrtc ships with a SpreedConnection class. The SpreedConnection
class is a wrapper around the WebSocket connection. Just like the SpreedAdapter, the SpreedConnection will queue messages
until a receiver is available to consume the messages. The SpreedConnection deserializes any incoming messages before passing
them to the receiver.

For outgoing messages, the SpreedAdapter will integrate with a SpreedMessager class that will know the contract
of the Spreed API. The SpreedMessager class is only responsible for creating Spreed compatible messages. It is the
responsibility of the SpreedAdapter to orchestrate and send the messages to the SpreedConnection.

If you find that the default adapter needs to be extended/modified you can create your own
adapter class that handles specific events and proxies all other events. Likewise, you can
use composition to create your own SpreedMessager class in order to accomodate your modified
version of the Spreed API.

# SpreedAdapter Design

![SpreedAdapter architecture](images/SpreedAdapter.jpg)

## Example

This example is meant to illustrate how you can integrate the different pieces to
create a Spreed + react-web-rtc conference.

```tsx
import * as React from 'react'
import { SpreedConn, SpreedAdapter } from 'react-conf-webrtc'
import { Conference, ConferenceMessage SpreedConn, SpreedAdapter } from 'react-conf-webrtc';

export class App extends React.Component<{}, {}> {
    private conn: SpreedConn;
    private adapter: SpreedAdapter;

    constructor() {
        super();
        this.conn = new SpreedConn('wss://localhost:8443/ws');
        this.adapter = new SpreedAdapter(this.conn);
        conn.onMessage = (msg: SpreedMessage) => {
            this.adapter.onMessage(msg)
        }
    }

    private refConference(room: Conference) {
        this.adapter.setRoom(room);
    }

    private onSend(message: ConferenceMessage) {
        this.adapter.send(message);
    }

    render() {
        return (
            <Conference
                send={this.onSend}
                ref={this.refConference}/>
        );
    }
}
```