import React, {useState, useEffect, useRef} from 'react';

const RoomSelector = ({socket, joinRoom}) => {
  const [rooms, setRooms] = useState([]);
  const [currentRoomId, setCurrentRoomId] = useState(null);
  const [roomName, setRoomName] = useState('');
  const roomNameInput = useRef(null);

  useEffect(() => {
    socket.on('roomList', setRooms);
    socket.emit('getRoomList');
  }, [socket]);

  const shareRoom = () => {
    const url = new URL(window.location);
    url.hash = '#' + currentRoomId;
    copyToClipboard(url.href);
  };

  const createRoom = ev => {
    ev.preventDefault();
    if(!roomName){
      return;
    }
    const formData = new FormData(ev.target);
    const {isPrivate} = Object.fromEntries(formData.entries());
    socket.emit('createRoom', {name: roomName, isPublic: !isPrivate});
    socket.once('roomCreated', id => {
      setCurrentRoomId(id);
      socket.once('roomClosed', () => {
        setCurrentRoomId(null);
      });
    });
    roomNameInput.current.value = '';
  };

  return <div className="room-selector">
    <div className="room-list-container">
      <h1>Public rooms</h1>
      <p>(click to join)</p>
      <div className="room-list">
        {rooms.map(room => <div key={room.id}>
          <span onClick={room.id !== currentRoomId ? (() => {
            joinRoom(room.id);
            setCurrentRoomId(null);
          }) : () => null}>
            {`${room.players}/${room.maxPlayers} ${room.name}${room.id === currentRoomId ? ' ◄' : ''}${!room.isPublic ? '   (private)' : ''}`}
          </span>
        </div>)}
      </div>
    </div>
    {!currentRoomId ?
      <form className={`create-room`} onSubmit={createRoom}>
        <input placeholder="Room name..."
          autoFocus
          maxLength="50"
          name="roomName"
          ref={roomNameInput}
          className="neon-border"
          onInput={ev => setRoomName(ev.target.value.trim())}
          required
          pattern=".*\S+.*"
          title="Come up with a name for your room" />
        <span>
          <button type="submit" className={!roomName ? 'disabled' : ''}>Create a room</button>
          <label className="private-label ml">Private
            <input type="checkbox" name="isPrivate" />
          </label>
        </span>
      </form>
      :
      <div className="d-flex flex-column p m room-id-container neon-border">
        <p className="mt-0">Room ID: {currentRoomId}</p>
        <button onClick={shareRoom}>Copy link to clipboard</button>
      </div>
    }
  </div>;
};

function copyToClipboard(str){
  const el = document.createElement('textarea');
  el.value = str;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
}

export default RoomSelector;
