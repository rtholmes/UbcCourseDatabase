## User Story 1
As a discord user, I want to generate and input in a course query so that I can create a course query

#### Definitions of Done
Scenario 1: Creating a course Query  
Given: The discord user calls a bot which will prompt the user  
When: The user inputs their query and the bot saves and stores the query for future queries  
Then: The user and the bot are both able to access and view the queries as required  

## User Story 2
As a discord user, I want to tell the bot to verify then run a course query, so I can view the results or get an error message if invalid

#### Definitions of Done
Scenario 1: Running a Valid Course Query  
Given: The discord user calls the bot to run a valid course query  
When: The bot verifies the query and runs it  
Then: The bot returns a text file with the results to the discord user  

Scenario 2: Running an Invalid Course Query  
Given: The discord user calls the bot to run an invalid course query  
When: The bot verifies it is invalid  
Then: The bot returns an error message explaining the error  
