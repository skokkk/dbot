var fs = require('fs');
jsbot = require('./jsbot');

///////////////////////////

Array.prototype.random = function() {
    return this[Math.floor((Math.random()*this.length))];
};

///////////////////////////

var admin = 'reality';
var waitingForKarma = false;
var name = 'depressionbot';
var db = JSON.parse(fs.readFileSync('db.json', 'utf-8'));

var instance = jsbot.createJSBot(name, 'elara.ivixor.net', 6667, function() {
    instance.join('#42');
    instance.join('#itonlygetsworse');
}.bind(this));

instance.addListener('JOIN', function(data) {
    if(data.user == 'Lamp') {
        instance.say(data.channel, db.lampPuns.random());
    } else if(data.user == 'Reality') {
        instance.say(data.channel, db.realiPuns.random());
    } else if(instance.inChannel(data.channel)) {
        instance.say('aisbot', '.karma ' + data.user);
        waitingForKarma = data.channel;
    }
});

instance.addListener('KICK', function(data) {
    if(data.kickee == name) {
	instance.join(data.channel);
        instance.say(data.channel, 'Thou shalt not kick ' + name);
    } else {
      instance.say(data.channel, data.kickee + '--');
    }
});

instance.addListener('PRIVMSG', function(data) {
    if(data.user == 'aisbot' && data.channel == name && waitingForKarma != false) {
        var split = data.message.split(' ');
        var target = split[0];
        var karma = split[3];

        if(karma.startsWith('-')) {
            instance.say(waitingForKarma, target + db.hatedPhrases.random() + ' (' + karma + ')');
        } else if(karma == '0') {
            instance.say(waitingForKarma, 'All ' + target + ' knows is that their gut says \'maybe.\' (0)');
        } else {
            instance.say(waitingForKarma, target + db.lovedPhrases.random() + ' (' + karma + ')');
        }

        waitingForKarma = false;
    }
});

instance.addListener('PRIVMSG', function(data) { 
    if(data.user == admin && data.channel == name) {
        params = data.message.split(' ');
        switch(params[0]) {
            case 'join':
                instance.join(params[1]);
                instance.say(admin, 'Joined ' + params[1]);
                break;
            case 'part':
                instance.part(params[1]);
                instance.say(admin, 'Left ' + params[1]);
                break;
            case 'reload':
                instance.say(admin, 'Reloading DB.');
                try {
                    db = JSON.parse(fs.readFileSync('db.json', 'utf-8'));
                } catch(err) {
                    instance.say(admin, 'DB reload failed.');
                } finally {
                    instance.say(admin, 'DB Reload successful.');
                }
                break;
            case 'say':
                var c = params[1];
                var m = params.slice(2).join(' ');
                instance.say(c, m);
                break;
        }
    }
});

instance.addListener('PRIVMSG', function(data) {
    if(instance.inChannel(data.channel) && data.message.startsWith('~')) {
        var params = data.message.split(' ');
        switch(params[0]) {
            case '~kc':
                instance.say('aisbot', '.karma ' + data.message.split(' ')[1]);
                waitingForKarma = data.channel;
                break;
            case '~qset':
                var qset = data.message.match(/~qset ([\d\w\s]*)=(.+)$/);
                if(qset != null && qset.length >= 3) {
                    db.quotes[qset[1]] = qset[2];
                    instance.say(data.channel, 'Quote saved as \'' + qset[1] + '\'');
                    fs.writeFile('db.json', JSON.stringify(db, null, '    '));
                } else {
                    instance.say(data.channel, 'Burn the invalid syntax!');
                }
                break;
            case '~q':
                var q = data.message.match(/~q ([\d\w\s]*)/)[1].trim();
                instance.say(data.channel, q + ': ' + db.quotes[q]);
                break;
            case '~qa':
                var q = data.message.match(/~qa ([\d\w\s]*)/)[1].trim();
                if(db.quoteArrs[q] != undefined) {
                    instance.say(data.channel, q + ': ' + db.quoteArrs[q].random());
                }
                break;
            case '~qadd':
                var qadd = data.message.match(/~qadd ([\d\w\s]*)=(.+)$/);
                if(qadd != null && qadd.length >= 3) {
                    if(Object.isArray(db.quoteArrs[qadd[1]])) {
                        db.quoteArrs[qadd[1]].push(qadd[2]);
                    } else {
                        db.quoteArrs[qadd[1]] = [qadd[2]];
                    }
                    instance.say(data.channel, 'Quote saved in \'' + qadd[1] + '\'');
                    fs.writeFile('db.json', JSON.stringify(db, null, '    '));
                } else {
                    instance.say(data.channel, 'Burn the invalid syntax!');
                }
                break;
            case '~lamp':
                instance.say(data.channel, db.lampPuns.random());
                break;
            case '~reality':
                instance.say(data.channel, db.realiPuns.random());
                break;
	    case '~rq':
                var rQuote = Object.keys(db.quotes).random();
	        instance.say(data.channel, rQuote + ': ' + db.quotes[rQuote]);
                break;
        }
    }
});

instance.addListener('PRIVMSG', function(data) {
    if(data.user == 'reality') {
        var once = data.message.match(/I ([\d\w\s]* once.)/);
        if(once != null) {
            db.realiPuns.push('reality ' + once[1]);
            instance.say(data.channel, '\'reality ' + once[1] + '\' saved.');
            fs.writeFile('db.json', JSON.stringify(db, null, '    '));
        }
    }
});
