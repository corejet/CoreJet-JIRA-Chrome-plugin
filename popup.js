var scenarioRegex = /^\s*Scenario(?: \d+)?: (.+)/i;
var givenRegex    = /^\s*Given (.+)/i;
var whenRegex     = /^\s*When (.+)/i;
var thenRegex     = /^\s*Then (.+)/i;
var andRegex      = /^\s*And (.+)/i;

function isNumeric(char) {
	var numbers = "0123456789";
	return numbers.indexOf(char) >= 0;
}

function normalize(str) {
    var tokens = str.split(/[^a-zA-Z0-9_]/);
    var newStr = "";

    for(var i = 0; i < tokens.length; ++i) {
        newStr += tokens[i].charAt(0).toUpperCase() + tokens[i].slice(1);
    }
	
	while (isNumeric(newStr.charAt(0))){
			newStr = newStr.charAt(1).toUpperCase() + newStr.slice(2);
	}

    return newStr;
}

chrome.extension.onRequest.addListener(
    function(request, sender, sendResponse) {
        
        var javaCode = 
            "import org.corejet.annotations.Scenario;\n" + 
            "import org.corejet.annotations.Story;\n" + 
            "import org.corejet.annotations.Given;\n" +
            "import org.corejet.annotations.When;\n" + 
            "import org.corejet.annotations.Then;\n" + 
            "import org.corejet.annotations.NotImplementedYet;\n" + 
            "import org.corejet.annotations.StorySource;\n" + 
            "import org.corejet.testrunner.CoreJetTestRunner;\n" + 
            "import org.junit.runner.RunWith;\n" +
            "import org.corejet.testrunner.CoreJetTestRunner;\n" +
            "import org.corejet.annotations.StorySource;\n" +
            "\n" +
            "@RunWith(CoreJetTestRunner.class)\n" +
            '@Story(id="' + request.key + '", title="' + request.title + '")\n' +
            "@StorySource(JiraStoryRepository.class)\n"+
            "public class " + normalize(request.key) + " {\n" +
            "\n";
        
        var pythonCode = 
            "import unittest2 as unittest\n" +
            "from corejet.core import Scenario, story, scenario, given, when, then\n"+
            "\n" +
            '@story(id="' + request.key + '", title="' + request.title + '")\n' +
            "class " + normalize(request.key) + "(unittest.TestCase):\n" +
            "\n";
        
        var lines = request.criteria.split('\n');
        var previousStep = null;
        var inScenario = false;
        
        for(var i = 0; i < lines.length; ++i) {
            var line = lines[i].trim();
            
            var scenarioMatch = scenarioRegex.exec(line);
            if(scenarioMatch != null) {
                
                if(inScenario) {
                    javaCode += '    }\n\n';
                }

                javaCode   += '    @NotImplementedYet\n';
                javaCode   += '    @Scenario("' + scenarioMatch[1] + '")\n';
                javaCode   += '    public static class ' + normalize(scenarioMatch[1]) + ' {\n\n';
                
                pythonCode += '    @scenario("' + scenarioMatch[1] + '")\n';
                pythonCode += '    class ' + normalize(scenarioMatch[1]) + '(Scenario):\n\n'
                
                previousStep = null;
                inScenario = true;
                continue;
            }
            
            var givenMatch = givenRegex.exec(line);
            if(givenMatch != null) {

                javaCode   += '        @Given("' + givenMatch[1] + '")\n';
                javaCode   += '        public void given' + normalize(givenMatch[1]) + '() {\n'
                javaCode   += '            \n';
                javaCode   += '        }\n\n';
                
                pythonCode += '        @given("' + givenMatch[1] + '")\n';
                pythonCode += '        def given' + normalize(givenMatch[1]) + '(self):\n'
                pythonCode += '            self.fail("Missing step")\n\n';
                
                previousStep = "given";
                continue;
            }
            
            var whenMatch = whenRegex.exec(line);
            if(whenMatch != null) {

                javaCode   += '        @When("' + whenMatch[1] + '")\n';
                javaCode   += '        public void when' + normalize(whenMatch[1]) + '() {\n'
                javaCode   += '            \n';
                javaCode   += '        }\n\n';

                pythonCode += '        @when("' + whenMatch[1] + '")\n';
                pythonCode += '        def when' + normalize(whenMatch[1]) + '(self):\n'
                pythonCode += '            self.fail("Missing step")\n\n';
                
                previousStep = "when";
                continue;
            }
            
            var thenMatch = thenRegex.exec(line);
            if(thenMatch != null) {

                javaCode   += '        @Then("' + thenMatch[1] + '")\n';
                javaCode   += '        public void then' + normalize(thenMatch[1]) + '() {\n'
                javaCode   += '            \n';
                javaCode   += '        }\n\n';

                pythonCode += '        @then("' + thenMatch[1] + '")\n';
                pythonCode += '        def then' + normalize(thenMatch[1]) + '(self):\n'
                pythonCode += '            self.fail("Missing step")\n\n';
                
                previousStep = "then";
                continue;
            }
            
            var andMatch = andRegex.exec(line);
            if(andMatch != null) {

                javaCode   += '        @' + normalize(previousStep) + '("' + andMatch[1] + '")\n';
                javaCode   += '        public void ' + previousStep + normalize(andMatch[1]) + '() {\n'
                javaCode   += '            \n';
                javaCode   += '        }\n\n';

                pythonCode += '        @' + previousStep + '("' + andMatch[1] + '")\n';
                pythonCode += '        def ' + previousStep + normalize(andMatch[1]) + '(self):\n'
                pythonCode += '            self.fail("Missing step")\n\n';
                continue;
            }
            
        }
        
        if(inScenario) {
            javaCode += '    }\n\n';
        }
        javaCode += '}\n';
        
        $("#java").text(javaCode);
        $("#python").text(pythonCode);
});

$(document).ready(function() {
    $("#heading-java").click(function() {
        $("#pane-java").show();
        $("#heading-java").addClass("active");
        $("#pane-python").hide();
        $("#heading-python").removeClass("active");
    });
    $("#heading-python").click(function() {
        $("#pane-python").show();
        $("#heading-python").addClass("active");
        $("#pane-java").hide();
        $("#heading-java").removeClass("active");
    });
    
    $("#pane-java").show();
    $("#heading-java").addClass("active");
    $("#pane-python").hide();
});

chrome.tabs.executeScript(null, {file: "jquery-1.6.1.js"});
chrome.tabs.executeScript(null, {file: "content_script.js"});