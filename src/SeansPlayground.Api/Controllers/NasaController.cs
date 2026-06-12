using Microsoft.AspNetCore.Mvc;
using SeansPlayground.Contracts.Nasa;
using SeansPlayground.Services.Nasa;

namespace SeansPlayground.Api.Controllers;

[ApiController]
[Route("api/nasa")]
public sealed class NasaController(INasaDashboardService nasaDashboardService) : ControllerBase
{
    [ProducesResponseType<NasaDashboardResponse>(StatusCodes.Status200OK)]
    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard(CancellationToken cancellationToken)
    {
        return Ok(await nasaDashboardService.GetDashboardAsync(cancellationToken));
    }

    [Produces("image/jpeg", "image/png", "image/webp")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [HttpGet("apod/latest/image")]
    public async Task<IActionResult> GetLatestApodImage(CancellationToken cancellationToken)
    {
        var image = await nasaDashboardService.GetLatestApodImageAsync(cancellationToken);

        return ToApodImageResult(image);
    }

    [Produces("image/jpeg", "image/png", "image/webp")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [HttpGet("apod/{date}/image")]
    public async Task<IActionResult> GetApodImage(DateOnly date, CancellationToken cancellationToken)
    {
        var image = await nasaDashboardService.GetApodImageAsync(date, cancellationToken);

        return ToApodImageResult(image);
    }

    private IActionResult ToApodImageResult(LatestApodImage? image)
    {
        if (image is null)
        {
            return NotFound();
        }

        Response.Headers.CacheControl = "public,max-age=900";
        Response.Headers.ETag = $"\"apod-{image.ApodDate:yyyyMMdd}\"";

        return File(image.Bytes, image.ContentType);
    }
}
