namespace CleanArch.Application.Common.Models;

public class Result<T>
{
    public bool Succeeded { get; set; }
    public T? Data { get; set; }
    public string? Message { get; set; }
    public List<string> Errors { get; set; } = [];

    public static Result<T> Success(T data, string? message = null) =>
        new() { Succeeded = true, Data = data, Message = message };

    public static Result<T> Failure(string message, List<string>? errors = null) =>
        new() { Succeeded = false, Message = message, Errors = errors ?? [] };

    public static Result<T> Failure(List<string> errors) =>
        new() { Succeeded = false, Message = "One or more validation failures occurred.", Errors = errors };
}

public class Result
{
    public bool Succeeded { get; set; }
    public string? Message { get; set; }
    public List<string> Errors { get; set; } = [];

    public static Result Success(string? message = null) =>
        new() { Succeeded = true, Message = message };

    public static Result Failure(string message, List<string>? errors = null) =>
        new() { Succeeded = false, Message = message, Errors = errors ?? [] };
}
