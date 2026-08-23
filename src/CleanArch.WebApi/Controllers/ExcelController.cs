using CleanArch.Application.Common.Interfaces;
using CleanArch.Application.Features.Products.Commands.ImportProducts;
using CleanArch.Application.Features.Products.Queries.ExportProducts;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;

namespace CleanArch.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ExcelController : ApiControllerBase
{
    private readonly IExcelService _excelService;
    private readonly IOutputCacheStore _outputCacheStore;

    private const string ExcelContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    public ExcelController(IExcelService excelService, IOutputCacheStore outputCacheStore)
    {
        _excelService = excelService;
        _outputCacheStore = outputCacheStore;
    }

    /// <summary>
    /// EXPERT EXPORT: Downloads a styled Excel spreadsheet containing all products,
    /// complete with conditional formatting, formulas, table styles, and freeze panes.
    /// </summary>
    [HttpGet("export-products")]
    public async Task<IActionResult> ExportProducts([FromQuery] string? category)
    {
        var fileBytes = await Mediator.Send(new ExportProductsQuery(category));
        var fileName = $"Products_Export_{DateTime.UtcNow:yyyyMMdd_HHmmss}.xlsx";

        return File(fileBytes, ExcelContentType, fileName);
    }

    /// <summary>
    /// EXPERT TEMPLATE: Downloads a pre-formatted Excel template with data validation
    /// (category dropdown list) to prevent user data entry errors during bulk import.
    /// </summary>
    [HttpGet("template")]
    public IActionResult DownloadTemplate()
    {
        var fileBytes = _excelService.GenerateProductTemplateExcel();
        var fileName = "Product_Import_Template.xlsx";

        return File(fileBytes, ExcelContentType, fileName);
    }

    /// <summary>
    /// EXPERT IMPORT: Uploads an Excel file (.xlsx), parses data rows, validates values,
    /// performs batch database insertion, and purges Output Cache tags.
    /// </summary>
    [HttpPost("import-products")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> ImportProducts([FromForm] IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new { error = "Please provide a valid non-empty Excel file." });
        }

        if (!file.FileName.EndsWith(".xlsx", StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(new { error = "Only .xlsx Excel files are supported." });
        }

        using var stream = file.OpenReadStream();
        var result = await Mediator.Send(new ImportProductsCommand(stream));

        // Purge Output Cache so cached product endpoints refresh
        await _outputCacheStore.EvictByTagAsync("products-tag", HttpContext.RequestAborted);

        return Ok(result);
    }
}
