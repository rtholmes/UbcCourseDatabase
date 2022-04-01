## User Story 1
As a discord user, I want to generate and input in a json formatted course query so that I can run a course query

#### Definitions of Done
**Scenario 1**: Creating a Course Query  
**Given**: The discord bot has been added to the server  
**When**: The discord user calls the bot which will prompt the user to input their query in a valid JSON format  
**Then**: The bot saves and stores it to be run for future queries or to view the id again  

## User Story 2
As a discord user, I want to tell the bot to verify then run a course query, so I can view the results or get an error message if invalid

#### Definitions of Done
**Scenario 1**: Running a Valid Course Query  
**Given**: The discord bot is added to the server & has a valid query saved  
**When**: The discord user calls the bot to run a saved, valid course query & the bot verifies and runs it  
**Then**: The bot returns a .txt file with the query results to the discord user  


**Scenario 2**: Running an Invalid Course Query  
**Given**: The discord bot is added to the server & has an invalid query saved  
**When**: The discord user calls the bot to run a saved, invalid course query that resolves with an error & the bot verifies it is invalid  
**Then**: The bot returns the error message, explaining the error to the discord user  
