var LoanRespondent = function(){
		this.excluded_state_list = ['AR', 'CT', 'DC', 'GA', 'MA', 'MT', 'NH', 'NY', 'SD', 'VT', 'WA', 'WV'];
		this.employed;
		this.state; // U.S. State NOT state pattern object - 3 cheers for added confusion!
		this.observers = [];
		this.currentState = new UnknownState(this);

		this.change = function(state){
			this.currentState = state;
			this.currentState.enter();
		}
	}

	LoanRespondent.prototype = {
		getEmployed: function(){
			return this.employed;
		},
		getState: function(){
			return this.state;
		},
		setState: function(state){
			this.state = state;
			this.notifyObservers(this);
		},
		setEmployed: function(employment_status){
			this.employed = employment_status;
			this.notifyObservers(this);
		},
		stateExcluded: function(){
			return this.excluded_state_list.indexOf(this.getState()) >= 0;
		},
		stateQualifies: function(){
			return !this.stateExcluded();
		},
		stateUnknown: function(){
			return this.state == undefined || this.state.length != 2;
		},
		employmentQualifies: function(){
			return this.employed == 'Yes';
		},
		employmentUnknown: function(){
			return this.employed == undefined || (this.employed != 'No' && this.employed != 'Yes');
		},
		qualifies: function(){
			if(this.employmentUnknown() || this.stateUnknown()){
				return undefined;
			}else{
				return this.stateQualifies() && this.employmentQualifies();
			}
		},
		addObserver: function(fn){
			this.observers.push(fn);
		},
		removeObserver: function(fn) {
        this.observers = this.observers.filter(
            function(item) {
                if (item !== fn) {
                    return item;
                }
            }
        );
    },
    notifyObservers: function(subject){
    	for(i = 0; i < this.observers.length; i++){
    		this.observers[i].update(subject);
    	}
    },
    handleInput(){
    	this.currentState.handleInput();
    }
	}

	var MyObserver = function(subject){
		subject.addObserver(this);
	}

	MyObserver.prototype = {
		update: function(observed){
			observed.handleInput();
		}
	}

	var UnknownState = function(respondent){
		this.handleInput = function(){
			console.log('UnknownState Handling input');
			var currentState = respondent.qualifies();
			if(currentState){
				console.log('changing to Qualified from Unknown');
				respondent.change(new QualifiedState(respondent));
			}else	if(currentState == false){
				console.log('changing to Unqualified from Unknown');
				respondent.change(new UnqualifiedState(respondent));
			}
		}

		this.enter = function(){
			console.log('changed to:  Unknown, setting up...');
		}
	}

	var QualifiedState = function(respondent){
		this.handleInput = function(){
			console.log('QualifiedState Handling input');
			var currentState = respondent.qualifies();
			if(currentState == undefined){
				console.log('changing to Unknown from Qualified');
				respondent.change(new UnknownState(respondent));
			}else	if(currentState == false){
				console.log('changing to Unqualified from Qualified');
				respondent.change(new UnqualifiedState(respondent));
			}
		}

		this.enter = function(){
			console.log('changed to:  Qualified, setting up...');
		}
	}

	var UnqualifiedState = function(respondent){
		this.handleInput = function(){
			console.log('UnqualifiedState Handling input');
			var currentState = respondent.qualifies();
			if(currentState){
				console.log('changing to Qualified from Unqualified');
				respondent.change(new QualifiedState(respondent));
			}else	if(currentState == undefined){
				console.log('changing to Unknown from Unqualified');
				respondent.change(new UnknownState(respondent));
			}
		}

		this.enter = function(){
			console.log('changed to:  UnqualifiedState, setting up...');
		}
	}

	var x = new LoanRespondent();

	new MyObserver(x);

	//x.setEmployed('No');
	//x.setEmployed('Yes');
	//x.setState('CA');
	//x.setState('NY');
	//x.setState('');
