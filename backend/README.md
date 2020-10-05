## How to run the application
This is the spring boot application. just start the application as standard java application. Spring will
start embed tomcat to host the application. The server port configuration can be found in the 
./kanbanBoard/backend/src/main/resources/application.yml

## Design Considerations
Since it is just a simple web restful service for the client UI. it follows the standard MVC concept.
The data are all stored in memory through Google guava cache class. It is thread safe. For future extension,
a permanent storage system can be integrated, such as database or RockDB. 

A filter is implemented to protect the privilege API endpoints, such as task updates.
 
## Unit testing
Because of time constrain, didn't implement the unit testing for the functions

