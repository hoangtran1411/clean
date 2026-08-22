var builder = DistributedApplication.CreateBuilder(args);

// Register our Clean Architecture Web API project under the service name "webapi"
var apiService = builder.AddProject<Projects.CleanArch_WebApi>("webapi");

builder.Build().Run();
