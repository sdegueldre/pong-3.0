import React from 'react';

const NameSelector = ({chooseUserName}) => {
  const userNameSubmit = ev => {
    ev.preventDefault();
    const formData = new FormData(ev.target);
    const {userName} = Object.fromEntries(formData.entries());
    chooseUserName(userName.trim());
  };

  return (
    <div className="username-selector">
      <form className="d-flex" onSubmit={userNameSubmit} style={{fontSize: '1rem'}}>
        <input placeholder="Enter a nickname..."
          autoFocus
          maxLength="25"
          name="userName"
          className="neon-border" />
        <button type="submit" className="ml">Go</button>
      </form>
    </div>
  );
};

export default NameSelector;
