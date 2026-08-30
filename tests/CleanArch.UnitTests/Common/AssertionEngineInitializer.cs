using System.Runtime.CompilerServices;
using FluentAssertions;

namespace CleanArch.UnitTests.Common;

internal static class AssertionEngineInitializer
{
    [ModuleInitializer]
    public static void Initialize()
    {
        License.Accepted = true;
    }
}
