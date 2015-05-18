var React = require('react');
var VoteActions = require('../actions/voteActions');
var cookie = require('react-cookie');

var VoteView = React.createClass({
  getInitialState: function(){
    return { 
      userInfo: cookie.load('userInfo'),
      voteData: this.props.object
    }
  },
  componentDidMount: function(){
    console.log(this.props.object)
    var voteStatus = this.state.voteData.rating;
    if (voteStatus > 0) {
      //highlight the up arrow
      console.log('HI VOTE');
    } else if (voteStatus < 0) {
      //highlight the down arrow
       console.log('low vote');
    } else {
      //no highlighting
    }
  },
  modifyProps: function(newData){
    var newstate = this.state.voteData;
    newstate.rating = newData.rating;

    this.setState({ voteData: newstate });
    
  },
  sendVote: function(rating){
    var votedata = this.state.voteData;
    var here = this;
    var voteInfo = { 
        voterId    : this.state.userInfo.userId,
        parentId   : votedata._id,
        user_name  : this.state.userInfo.sUserName,
        voteType   : votedata.type,
        voteRating : rating,
        userImage  : this.state.userInfo.image['24']
    }

    VoteActions.sendVote(voteInfo, here.modifyProps);
  },
  voteTypes: {
    up: function(){this.sendVote(1);} ,
    down: function(){this.sendVote(-1);}
  },
  render: function(){
    return(
      <div>
        <div>
          <button className="" type="text" ref="upVote" onClick={(this.voteTypes.up).bind(this)}>
          </button>
        </div>
        <div>
          <button className="" type="text" ref="rating">
            {this.state.voteData.rating}
          </button>
        </div>
        <div>
          <button className="" type="text" ref="downVote" onClick={(this.voteTypes.down).bind(this)}>
          </button>
        </div>
      </div>
    )
  }
});

module.exports = VoteView;