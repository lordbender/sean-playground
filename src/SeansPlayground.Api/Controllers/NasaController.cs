using Microsoft.AspNetCore.Mvc;
using SeansPlayground.Services.Nasa;

namespace SeansPlayground.Api.Controllers;

[ApiController]
[Route("api/nasa")]
public sealed class NasaController(INasaDashboardService nasaDashboardService) : ControllerBase
{
    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard(CancellationToken cancellationToken)
    {
        return Ok(await nasaDashboardService.GetDashboardAsync(cancellationToken));
    }

    [HttpGet("apod/latest/image")]
    public async Task<IActionResult> GetLatestApodImage(CancellationToken cancellationToken)
    {
        var image = await nasaDashboardService.GetLatestApodImageAsync(cancellationToken);

        if (image is null)
        {
            return NotFound();
        }

        Response.Headers.CacheControl = "public,max-age=900";
        Response.Headers.ETag = $"\"apod-{image.ApodDate:yyyyMMdd}\"";

        return File(image.Bytes, image.ContentType);
    }
}
