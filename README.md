# UBC Course Database

This app is a discord bot to sort through different queries of different ubc courses.  

After adding the bot to a server type !menu and you will be given the option to save, view, or run queries on the stored database. 
After you finish your action type !menu again to return to the start with the new state of the database.
Below is the valid EBNF which you will use to create json queries


> QUERY ::='{'BODY ', ' OPTIONS '}'  
> 
> BODY ::= 'WHERE:{' FILTER? '}'  
> // Note: a BODY with no FILTER (i.e. WHERE:{}) matches all entries.
> OPTIONS ::= 'OPTIONS:{' COLUMNS (', ORDER:' key )?'}'  
> 
> FILTER ::= LOGICCOMPARISON | MCOMPARISON | SCOMPARISON | NEGATION
> 
> LOGICCOMPARISON ::= LOGIC ':[{' FILTER ('}, {' FILTER )* '}]'  
> MCOMPARISON ::= MCOMPARATOR ':{' mkey ':' number '}'
> SCOMPARISON ::= 'IS:{' skey ':' [*]? inputstring [*]? '}'  // Asterisks should act as wildcards.
> NEGATION ::= 'NOT :{' FILTER '}'  
> 
> LOGIC ::= 'AND' | 'OR'  
> MCOMPARATOR ::= 'LT' | 'GT' | 'EQ'  
> 
> COLUMNS ::= 'COLUMNS:[' key (',' key)* ']'  
> 
> key ::= mkey | skey
> mkey ::= idstring '_' mfield
> skey ::= idstring '_' sfield  
> mfield ::= 'avg' | 'pass' | 'fail' | 'audit' | 'year'  
> sfield ::=  'dept' | 'id' | 'instructor' | 'title' | 'uuid'  
> idstring ::= [^_]+ // One or more of any character, except underscore.  
> inputstring ::= [^*]* // Zero or more of any character, except asterisk.
