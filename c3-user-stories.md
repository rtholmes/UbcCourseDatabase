## User Story 1
As a discord user, I want to generate and in query so that I can create a query

#### Definitions of Done
Scenario 1: Creating a Query  
Given: The discord user calls a bot which will prompt the user  
When: The user inputs their query and the bot stores it  
Then: The user can then save the query to be used for a future queries  

## User Story 2
As a discord user, I want to tell the bot to verify then run a query, so I can view the results or get an error message if invalid

#### Definitions of Done
Scenario 1: Running a Valid Query  
Given: The discord user calls the bot to run a valid query  
When: The bot verifies the query and runs it  
Then: The bot returns the results to the discord user

Scenario 2: Running an Invalid Query  
Given: The discord user calls the bot to run an invalid query  
When: The bot verifies it is invalid
Then: The bot returns the error message explaining the error
